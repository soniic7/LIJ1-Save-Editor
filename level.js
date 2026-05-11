// levels.js

// 1. Export the Level IDs so other files can loop through them if needed
export const mainLevelIds = [
    "1-1", "1-2", "1-3", "1-4", "1-5", "1-6",
    "2-1", "2-2", "2-3", "2-4", "2-5", "2-6",
    "3-1", "3-2", "3-3", "3-4", "3-5", "3-6"
];
export const bonusLevelIds = ["YoungIndy", "AncientCity", "Warehouse"];

// 2. Export the Memory Bank
export const levelData = {};

// Populate Main Levels with their default values
mainLevelIds.forEach(id => {
    levelData[id] = {
        type: 'main',
        trueAdventurer: false,
        trueAdventurerLegacy: false,
        storyUnlocked: false,
        freeplayUnlocked: false,
        artifactBuiltOrder: 0,
        artifactsCollected: 0,
        artifactBuilt: false,
        parcelPosted: false
    };
});

// Populate Bonus Levels with their default values
bonusLevelIds.forEach(id => {
    levelData[id] = {
        type: 'bonus',
        unlocked: false,
        completed: false,
        fastestTime: 4294967295
    };
});

// 3. Export the tracker so other files know which level is currently on screen
export let currentLevel = "1-1"; 

// --- The rest of your DOM logic stays exactly the same, no exports needed here ---

const levelSelectInput = document.getElementById('levelSelectInput');
const mainLevelsDiv = document.getElementById('mainLevels');
const bonusLevelsDiv = document.getElementById('bonusLevels');

levelSelectInput.addEventListener('change', (e) => {
    currentLevel = e.target.value;
    const data = levelData[currentLevel];

    if (data.type === 'main') {
        mainLevelsDiv.style.display = 'block';
        bonusLevelsDiv.style.display = 'none';

        document.getElementById('trueAdventurerInput').checked = data.trueAdventurer;
        document.getElementById('trueAdventurerLegacyInput').checked = data.trueAdventurerLegacy;
        document.getElementById('storyUnlockedInput').checked = data.storyUnlocked;
        document.getElementById('freeplayUnlockedInput').checked = data.freeplayUnlocked;
        document.getElementById('artifactBuiltOrderInput').value = data.artifactBuiltOrder;
        document.getElementById('artifactsCollectedInput').value = data.artifactsCollected;
        document.getElementById('artifactBuiltInput').checked = data.artifactBuilt;
        document.getElementById('parcelPostedInput').checked = data.parcelPosted;
    } else {
        mainLevelsDiv.style.display = 'none';
        bonusLevelsDiv.style.display = 'block';

        document.getElementById('bonusLevelUnlockedInput').checked = data.unlocked;
        document.getElementById('bonusLevelCompletedInput').checked = data.completed;
        document.getElementById('fastestTimeInput').value = data.fastestTime;
    }
});

const levelInputs = [
    { id: 'trueAdventurerInput', key: 'trueAdventurer', isCheckbox: true },
    { id: 'trueAdventurerLegacyInput', key: 'trueAdventurerLegacy', isCheckbox: true },
    { id: 'storyUnlockedInput', key: 'storyUnlocked', isCheckbox: true },
    { id: 'freeplayUnlockedInput', key: 'freeplayUnlocked', isCheckbox: true },
    { id: 'artifactBuiltOrderInput', key: 'artifactBuiltOrder', isCheckbox: false },
    { id: 'artifactsCollectedInput', key: 'artifactsCollected', isCheckbox: false },
    { id: 'artifactBuiltInput', key: 'artifactBuilt', isCheckbox: true },
    { id: 'parcelPostedInput', key: 'parcelPosted', isCheckbox: true },
    { id: 'bonusLevelUnlockedInput', key: 'unlocked', isCheckbox: true },
    { id: 'bonusLevelCompletedInput', key: 'completed', isCheckbox: true },
    { id: 'fastestTimeInput', key: 'fastestTime', isCheckbox: false }
];

levelInputs.forEach(inputDef => {
    const el = document.getElementById(inputDef.id);
    if (!el) return;

    el.addEventListener('input', (e) => {
        let newValue = inputDef.isCheckbox ? e.target.checked : e.target.value;
        
        if (!inputDef.isCheckbox) {
            newValue = newValue === "" ? 0 : parseInt(newValue, 10);
        }

        levelData[currentLevel][inputDef.key] = newValue;
    });
});