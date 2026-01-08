import { GameState } from '../interfaces/game.interface.js';
import { equipItem, unequipItem } from './state.helper.js';

const mockState: GameState = {
    character: {
        name: 'Test Hero',
        class: 'Warrior',
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        inventory: [
            { id: 'item1', name: 'Sword', type: 'weapon', description: 'A sharp blade' },
            { id: 'item2', name: 'Shield', type: 'weapon', description: 'A sturdy shield' }, // Treated as weapon for slotting
            { id: 'item3', name: 'Axe', type: 'weapon', description: 'A heavy axe' }
        ],
        equipment: {},
        stats: { strength: 10, dexterity: 10, intelligence: 10, luck: 10 }
    },
    location: 'Test Arena',
    narrativeHistory: [],
    narrativeSummary: 'Testing begins'
};

console.log('--- Initial State ---');
console.log('Inventory:', mockState.character.inventory.map(i => i.name));
console.log('Equipment:', mockState.character.equipment);

// Test Equip Weapon
console.log('\n--- Testing Equip item1 (Sword) ---');
let result = equipItem(mockState, 'item1');
console.log('Success:', result.success);
console.log('Logs:', result.logs);
console.log('Inv after:', result.newState.character.inventory.map((i: any) => i.name));
console.log('Eq after:', result.newState.character.equipment.mainHand?.name);

// Test Swap Weapon
console.log('\n--- Testing Swap item1 (Sword) with item3 (Axe) ---');
let result2 = equipItem(result.newState, 'item3');
console.log('Success:', result2.success);
console.log('Logs:', result2.logs);
console.log('Inv after (should have Sword):', result2.newState.character.inventory.map((i: any) => i.name));
console.log('Eq after (should be Axe):', result2.newState.character.equipment.mainHand?.name);

// Test Unequip
console.log('\n--- Testing Unequip mainHand ---');
let result3 = unequipItem(result2.newState, 'mainHand');
console.log('Success:', result3.success);
console.log('Logs:', result3.logs);
console.log('Inv after (should have Sword, Axe):', result3.newState.character.inventory.map((i: any) => i.name));
console.log('Eq after (should be empty):', result3.newState.character.equipment.mainHand);

if (result3.success && result2.newState.character.equipment.mainHand?.name === 'Axe' && result3.newState.character.inventory.length === 3) {
    console.log('\n✅ UNIT TEST PASSED');
    process.exit(0);
} else {
    console.log('\n❌ UNIT TEST FAILED');
    process.exit(1);
}
