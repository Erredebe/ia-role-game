import { GameState, Item, Equipment } from '../interfaces/game.interface.js';

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

/**
 * Applies updates from the AI (partial GameState) to the current GameState.
 * Explicitly handles complex objects like Inventory and Equipment.
 */
export const applyStateUpdate = (currentState: GameState, updatedState: Partial<GameState>): { newState: GameState, logs: string[] } => {
    const newState = JSON.parse(JSON.stringify(currentState)); // Deep copy to avoid mutation issues
    const logs: string[] = [];

    if (!updatedState) return { newState, logs };

    const oldInventoryNames = newState.character.inventory.map((i: Item) => i.name).sort();
    const inventoryProvided = updatedState.character?.inventory !== undefined;
    const equipmentUpdate = updatedState.character?.equipment;
    const equipmentProvided = equipmentUpdate !== undefined;

    // 1. Handle Character HP
    if (updatedState.character?.hp !== undefined) {
        const delta = updatedState.character.hp;
        // Apply delta (AI sends relative change usually, but sometimes absolute - logic below assumes relative if small, or check prompt)
        // Wait, prompt says: "hp" es un cambio relativo (ej: -10 por dano, 5 por curacion).
        
        const oldHp = newState.character.hp;
        newState.character.hp = Math.max(0, Math.min(
            newState.character.maxHp,
            oldHp + delta
        ));
        
        if (delta !== 0) {
            logs.push(`HP: ${delta > 0 ? '+' : ''}${delta} (${newState.character.hp}/${newState.character.maxHp})`);
        }
    }

    // 2. Handle Inventory
    // Strategy: If AI provides inventory, we assume it's the NEW list (taking into account items removed/added).
    // The AI prompt will be updated to instruct "inventory" should be the COMPLETE new list if changed.
    if (inventoryProvided) {
        const newInventory = Array.isArray(updatedState.character?.inventory)
            ? updatedState.character.inventory.map((item: any) => normalizeItem(item))
            : [];
        newState.character.inventory = newInventory;
    }

    // 3. Handle Equipment
    // Strategy: Merge updates. If AI sends "head": { ... }, replace head. 
    if (equipmentUpdate && typeof equipmentUpdate === 'object') {
        if (!newState.character.equipment) newState.character.equipment = {};
        
        const equipmentUpdates = equipmentUpdate as Equipment; // Partial<Equipment> actually

        for (const [slot, item] of Object.entries(equipmentUpdates)) {
            // If item is null/undefined in update, implies unequip? Or just ignore? 
            // Usually JSON won't have undefined keys. If explicit null, we unequip.
            // If it has object, we equip.
            
            // Allow null to clear slot
            if (item === null) {
                const equippedItem = newState.character.equipment[slot as keyof Equipment];
                if (equippedItem) {
                    newState.character.equipment[slot as keyof Equipment] = undefined;
                    logs.push(`Desequipado: ${slot}`);
                    if (!inventoryProvided && !inventoryHasItem(newState.character.inventory, equippedItem)) {
                        newState.character.inventory.push(equippedItem);
                    }
                }
            } else if (item !== undefined) {
                const normalizedItem = normalizeItem(item);
                const currentEquipped = newState.character.equipment[slot as keyof Equipment];
                if (currentEquipped && !inventoryProvided && !inventoryHasItem(newState.character.inventory, currentEquipped)) {
                    newState.character.inventory.push(currentEquipped);
                }
                newState.character.equipment[slot as keyof Equipment] = normalizedItem;
                logs.push(`Equipado ${slot}: ${normalizedItem.name}`);
            }
        }
    }

    if ((inventoryProvided || equipmentProvided) && newState.character.equipment) {
        for (const equippedItem of Object.values(newState.character.equipment)) {
            if (equippedItem) {
                removeFirstMatch(newState.character.inventory, equippedItem);
            }
        }
    }

    const finalInventoryNames = newState.character.inventory.map((i: Item) => i.name).sort();
    if (JSON.stringify(oldInventoryNames) !== JSON.stringify(finalInventoryNames)) {
        logs.push(`Inventario actualizado: ${finalInventoryNames.join(', ') || 'Vacio'}`);
    }

    // 4. Handle other simple fields if necessary (mana, stats, etc - not strictly requested but good for future)
    if (updatedState.character?.mana !== undefined) {
         const delta = updatedState.character.mana;
         newState.character.mana = Math.max(0, Math.min(
            newState.character.maxMana, 
            newState.character.mana + delta
        ));
    }

    return { newState, logs };
};

/**
 * Deterministically equips an item from inventory.
 * Automatically handles swapping if slot is occupied.
 */
export const equipItem = (state: GameState, itemId: string): { newState: GameState, logs: string[], success: boolean } => {
    const newState = JSON.parse(JSON.stringify(state));
    const logs: string[] = [];
    
    // Find item in inventory
    const inventoryIndex = newState.character.inventory.findIndex((i: Item) => i.id === itemId);
    if (inventoryIndex === -1) {
        return { newState, logs: ['Item no encontrado en inventario.'], success: false };
    }

    const itemToEquip = newState.character.inventory[inventoryIndex];
    let slot: keyof Equipment | undefined;

    // Determine slot based on type
    switch (itemToEquip.type) {
        case 'weapon':
            // Logic: if mainHand empty, use it. If full, check offHand? For now default to mainHand.
            // Future: check if 2-handed, etc.
            slot = 'mainHand'; 
            break;
        case 'armor':
            // Simplification: armor type usually implies body/head. 
            // We might need 'armorType' property or heuristic name check. 
            // For now, let's assume 'armor' = body unless name says 'Casco', 'Yelmo', 'Hat'
            if (itemToEquip.name.toLowerCase().match(/(casco|yelmo|sombrero|gorro|head|helmet)/)) {
                slot = 'head';
            } else {
                slot = 'body';
            }
            break;
        case 'accessory':
            // Fill accessory1 first, then 2.
            if (!newState.character.equipment.accessory1) slot = 'accessory1';
            else if (!newState.character.equipment.accessory2) slot = 'accessory2';
            else slot = 'accessory1'; // Swap 1 if both full
            break;
        default:
            logs.push(`No se puede equipar items de tipo ${itemToEquip.type}`);
            return { newState, logs, success: false };
    }

    if (!slot) {
         logs.push('No se pudo determinar el slot para este item.');
         return { newState, logs, success: false };
    }

    // Check if something is in the slot
    const currentEquipped = newState.character.equipment[slot];

    // 1. Remove item from inventory
    newState.character.inventory.splice(inventoryIndex, 1);

    // 2. If slot has item, move it to inventory
    if (currentEquipped) {
        newState.character.inventory.push(currentEquipped);
        logs.push(`Has desequipado: ${currentEquipped.name}`);
    }

    // 3. Equip new item
    newState.character.equipment[slot] = itemToEquip;
    logs.push(`Has equipado: ${itemToEquip.name} en ${slot}`);

    return { newState, logs, success: true };
};

/**
 * Deterministically unequips an item from a slot.
 */
export const unequipItem = (state: GameState, slot: keyof Equipment): { newState: GameState, logs: string[], success: boolean } => {
    const newState = JSON.parse(JSON.stringify(state));
    const logs: string[] = [];

    const item = newState.character.equipment[slot];
    if (!item) {
        return { newState, logs: ['No hay nada equipado en ese slot.'], success: false };
    }

    // Move to inventory
    newState.character.inventory.push(item);
    
    // Clear slot
    newState.character.equipment[slot] = undefined; // or delete key

    logs.push(`Has desequipado: ${item.name}`);

    return { newState, logs, success: true };
};
