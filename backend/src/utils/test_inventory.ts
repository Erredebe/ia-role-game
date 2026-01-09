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
            { id: 'item2', name: 'Shield', type: 'weapon', description: 'A sturdy shield' },
            { id: 'item3', name: 'Axe', type: 'weapon', description: 'A heavy axe' }
        ],
        equipment: {},
        stats: { strength: 10, dexterity: 10, intelligence: 10, luck: 10 }
    },
    location: 'Test Arena',
    narrativeHistory: [],
    narrativeSummary: 'Testing begins'
};

const logState = (label: string, state: GameState) => {
    console.log(label);
    console.log('Inventory:', state.character.inventory.map(i => i.name));
    console.log('Equipment:', state.character.equipment);
};

logState('--- Initial State ---', mockState);

console.log('\n--- Testing Equip item1 (Sword) ---');
const result = equipItem(mockState, 'item1');
console.log('Success:', result.success);
console.log('Logs:', result.logs);
logState('After equip:', result.newState);
console.log('Equipped:', result.newState.character.equipment.mainHand?.name);

console.log('\n--- Testing Swap item1 (Sword) with item3 (Axe) ---');
const result2 = equipItem(result.newState, 'item3');
console.log('Success:', result2.success);
console.log('Logs:', result2.logs);
logState('After swap:', result2.newState);
console.log('Equipped:', result2.newState.character.equipment.mainHand?.name);

console.log('\n--- Testing Unequip mainHand ---');
const result3 = unequipItem(result2.newState, 'mainHand');
console.log('Success:', result3.success);
console.log('Logs:', result3.logs);
logState('After unequip:', result3.newState);

if (result3.success && result2.newState.character.equipment.mainHand?.name === 'Axe' && result3.newState.character.inventory.length === 3) {
    console.log('\nOK. UNIT TEST PASSED');
    process.exit(0);
} else {
    console.log('\nERROR. UNIT TEST FAILED');
    process.exit(1);
}
