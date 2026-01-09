import { GameState, Item, Equipment } from '../interfaces/game.interface.js';

// Deep clone so we can mutate safely without side effects.
const cloneState = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// Coerce loose item payloads into the Item shape used by the game state.
const normalizeItem = (item: any): Item => {
    if (typeof item === 'string') {
        return { id: item, name: item, type: 'misc', description: '' };
    }

    const name = typeof item?.name === 'string' ? item.name : '';
    const id = typeof item?.id === 'string' && item.id ? item.id : name;

    return {
        id,
        name: name || (typeof item?.id === 'string' ? item.id : 'Item'),
        type: item?.type || 'misc',
        description: item?.description || '',
        stats: item?.stats,
        icon: item?.icon
    };
};

const normalizeName = (value: string | undefined): string => (value || '').trim().toLowerCase();

// Normalize inventory input (strings or objects) into Item objects.
const normalizeInventory = (inventory: any): Item[] =>
    Array.isArray(inventory) ? inventory.map((item: any) => normalizeItem(item)) : [];

const getInventoryNames = (inventory: Item[]): string[] =>
    inventory.map((item: Item) => item.name).sort();

const logInventoryChange = (logs: string[], before: string[], after: string[]): void => {
    if (JSON.stringify(before) !== JSON.stringify(after)) {
        logs.push(`Inventario actualizado: ${after.join(', ') || 'Vacio'}`);
    }
};

// Match by id when present, otherwise name + type.
const itemsMatch = (left: Item, right: Item): boolean => {
    if (left.id && right.id && left.id === right.id) return true;

    const leftName = normalizeName(left.name);
    const rightName = normalizeName(right.name);
    if (!leftName || !rightName) return false;

    const leftType = left.type || 'misc';
    const rightType = right.type || 'misc';

    return leftName === rightName && leftType === rightType;
};

const inventoryHasItem = (inventory: Item[], item: Item): boolean =>
    inventory.some((entry: Item) => itemsMatch(entry, item));

const removeFirstMatch = (inventory: Item[], item: Item): void => {
    const index = inventory.findIndex((entry: Item) => itemsMatch(entry, item));
    if (index !== -1) inventory.splice(index, 1);
};

const ensureEquipment = (state: GameState): Equipment => {
    if (!state.character.equipment) state.character.equipment = {};
    return state.character.equipment;
};

// Apply a delta while keeping values in bounds.
const applyBoundedDelta = (current: number, delta: number, max: number): number =>
    Math.max(0, Math.min(max, current + delta));

// Resolve which slot an item should occupy based on type and current equipment.
const resolveEquipSlot = (item: Item, equipment: Equipment): keyof Equipment | undefined => {
    switch (item.type) {
        case 'weapon':
            return 'mainHand';
        case 'armor': {
            const name = normalizeName(item.name);
            return name.match(/(casco|yelmo|sombrero|gorro|head|helmet)/) ? 'head' : 'body';
        }
        case 'accessory':
            if (!equipment.accessory1) return 'accessory1';
            if (!equipment.accessory2) return 'accessory2';
            return 'accessory1';
        default:
            return undefined;
    }
};

// Apply equipment updates and keep inventory consistent when it is not authoritative.
const applyEquipmentUpdates = (
    equipment: Equipment,
    updates: Equipment,
    inventory: Item[],
    logs: string[],
    inventoryProvided: boolean
): void => {
    for (const [slot, item] of Object.entries(updates)) {
        if (item === null) {
            const equippedItem = equipment[slot as keyof Equipment];
            if (equippedItem) {
                delete equipment[slot as keyof Equipment];
                logs.push(`Desequipado: ${slot}`);
                if (!inventoryProvided && !inventoryHasItem(inventory, equippedItem)) {
                    inventory.push(equippedItem);
                }
            }
            continue;
        }

        if (item === undefined) continue;

        const normalizedItem = normalizeItem(item);
        const currentEquipped = equipment[slot as keyof Equipment];
        if (currentEquipped && !inventoryProvided && !inventoryHasItem(inventory, currentEquipped)) {
            inventory.push(currentEquipped);
        }

        equipment[slot as keyof Equipment] = normalizedItem;
        logs.push(`Equipado ${slot}: ${normalizedItem.name}`);
    }
};

// Ensure equipped items do not remain in the inventory list.
const syncInventoryWithEquipment = (inventory: Item[], equipment: Equipment): void => {
    for (const equippedItem of Object.values(equipment)) {
        if (equippedItem) {
            removeFirstMatch(inventory, equippedItem);
        }
    }
};

/**
 * Applies updates from the AI (partial GameState) to the current GameState.
 * Explicitly handles complex objects like Inventory and Equipment.
 * 
 * CRITICAL: If inventory changes, stateChangeJustification.inventory MUST be provided.
 * Otherwise the change is rejected and inventory is not modified.
 */
export const applyStateUpdate = (
    currentState: GameState, 
    updatedState: Partial<GameState>,
    stateChangeJustification?: { inventory?: string; hp?: string; equipment?: string; other?: string }
): { newState: GameState, logs: string[] } => {
    const newState = cloneState(currentState);
    const logs: string[] = [];

    if (!updatedState) return { newState, logs };

    const oldInventoryNames = getInventoryNames(newState.character.inventory);
    const inventoryProvided = updatedState.character?.inventory !== undefined;
    const equipmentUpdate = updatedState.character?.equipment;
    const equipmentProvided = equipmentUpdate !== undefined;

    // 1. Handle Character HP
    if (updatedState.character?.hp !== undefined) {
        const delta = updatedState.character.hp;
        // Apply delta (AI sends relative change usually, but sometimes absolute - logic below assumes relative if small, or check prompt)
        // Wait, prompt says: "hp" es un cambio relativo (ej: -10 por dano, 5 por curacion).
        
        const oldHp = newState.character.hp;
        newState.character.hp = applyBoundedDelta(oldHp, delta, newState.character.maxHp);
        
        if (delta !== 0) {
            logs.push(`HP: ${delta > 0 ? '+' : ''}${delta} (${newState.character.hp}/${newState.character.maxHp})`);
        }
    }

    // 2. Handle Inventory
    // ⚠️ CRITICAL: If inventory changes, justification MUST be provided
    if (inventoryProvided) {
        if (!stateChangeJustification?.inventory) {
            console.warn(
                '⚠️ INVENTORY CHANGE REJECTED: AI tried to change inventory without justification'
            );
            logs.push('❌ Cambio de inventario rechazado: sin justificación narrativa explícita');
            // DO NOT apply the inventory change - keep current inventory
        } else {
            newState.character.inventory = normalizeInventory(updatedState.character?.inventory);
            logs.push(`✓ ${stateChangeJustification.inventory}`);
        }
    }

    // 3. Handle Equipment
    // Strategy: Merge updates. If AI sends "head": { ... }, replace head. 
    if (equipmentUpdate && typeof equipmentUpdate === 'object') {
        const equipment = ensureEquipment(newState);
        applyEquipmentUpdates(equipment, equipmentUpdate as Equipment, newState.character.inventory, logs, inventoryProvided);
    }

    if ((inventoryProvided || equipmentProvided) && newState.character.equipment) {
        syncInventoryWithEquipment(newState.character.inventory, newState.character.equipment);
    }

    const finalInventoryNames = getInventoryNames(newState.character.inventory);
    logInventoryChange(logs, oldInventoryNames, finalInventoryNames);

    // 4. Handle other simple fields if necessary (mana, stats, etc - not strictly requested but good for future)
    if (updatedState.character?.mana !== undefined) {
         const delta = updatedState.character.mana;
         newState.character.mana = applyBoundedDelta(newState.character.mana, delta, newState.character.maxMana);
    }

    return { newState, logs };
};

/**
 * Deterministically equips an item from inventory.
 * Automatically handles swapping if slot is occupied.
 */
export const equipItem = (state: GameState, itemId: string): { newState: GameState, logs: string[], success: boolean } => {
    const newState = cloneState(state);
    const logs: string[] = [];
    const equipment = ensureEquipment(newState);
    
    // Find item in inventory
    const inventoryIndex = newState.character.inventory.findIndex((i: Item) => i.id === itemId);
    if (inventoryIndex === -1) {
        return { newState, logs: ['Item no encontrado en inventario.'], success: false };
    }

    const itemToEquip = newState.character.inventory[inventoryIndex];
    if (!itemToEquip) {
        return { newState, logs: ['Item no encontrado en inventario.'], success: false };
    }
    const slot = resolveEquipSlot(itemToEquip, equipment);

    if (!slot) {
        logs.push(`No se puede equipar items de tipo ${itemToEquip.type}`);
        return { newState, logs, success: false };
    }

    // Check if something is in the slot
    const currentEquipped = equipment[slot];

    // 1. Remove item from inventory
    newState.character.inventory.splice(inventoryIndex, 1);

    // 2. If slot has item, move it to inventory
    if (currentEquipped) {
        newState.character.inventory.push(currentEquipped);
        logs.push(`Has desequipado: ${currentEquipped.name}`);
    }

    // 3. Equip new item
    equipment[slot] = itemToEquip;
    logs.push(`Has equipado: ${itemToEquip.name} en ${slot}`);

    return { newState, logs, success: true };
};

/**
 * Deterministically unequips an item from a slot.
 */
export const unequipItem = (state: GameState, slot: keyof Equipment): { newState: GameState, logs: string[], success: boolean } => {
    const newState = cloneState(state);
    const logs: string[] = [];
    const equipment = ensureEquipment(newState);

    const item = equipment[slot];
    if (!item) {
        return { newState, logs: ['No hay nada equipado en ese slot.'], success: false };
    }

    // Move to inventory
    newState.character.inventory.push(item);
    
    // Clear slot
    delete equipment[slot];

    logs.push(`Has desequipado: ${item.name}`);

    return { newState, logs, success: true };
};
