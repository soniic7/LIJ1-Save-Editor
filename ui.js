import { validPercents } from "./validpercentages.js";
import { hints, updateAllHintStates } from "./hints.js";
import { currentState, historyConfig, undoStack, redoStack, updateButtons } from './history.js';
import {
    hatOptions, hairOptions, headOptions,
    weaponOptions, armsOptions, handsOptions,
    torsoOptions, hipsOptions, legsOptions
} from './characterParts.js';
import { levelData, currentLevel, mainLevelIds, bonusLevelIds, artifactDupeCounts } from './level.js';

export function initUI() {
    initTabs();
    initPercentageSnap();
    initLevelSelect();

    const startingLevel = document.getElementById('levelSelectInput').value;
    updateArtifactUI(startingLevel);
    loadArtifactUI(startingLevel);
}

// --- Tab Switching Logic ---
function initTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            if (targetId) {
                document.getElementById(targetId).classList.add('active');
            }
        });
    });
}

// --- Percentage Snapping Logic ---
function initPercentageSnap() {
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('snap-input')) {
            let userInput = parseFloat(e.target.value);

            if (isNaN(userInput)) {
                e.target.value = 0;
                return;
            }

            // Find the closest percentage from validPercents
            const closestPercent = validPercents.reduce((prev, curr) => {
                return (Math.abs(curr - userInput) < Math.abs(prev - userInput) ? curr : prev);
            });

            e.target.value = closestPercent;

            // Ensure completionMap is defined globally or imported if you use it here
            if (typeof completionMap !== 'undefined') {
                const hexValue = completionMap[closestPercent];
                console.log(`Matched %: ${closestPercent} | Hex to Write: ${hexValue}`);
                e.target.setAttribute('data-hex', hexValue);
            }
        }
    });
}

// --- Level Selection Logic ---
function initLevelSelect() {
    const levelSelect = document.getElementById('levelSelectInput');
    let mainDiv = document.getElementById('mainLevels');
    let bonusDiv = document.getElementById('bonusLevels');

    if (!levelSelect) return;

    // 1. THE NUKE OPTION: Destroy the wrappers that break the grid
    if (mainDiv && bonusDiv) {
        Array.from(mainDiv.children).forEach(c => c.classList.add('is-main-card'));
        Array.from(bonusDiv.children).forEach(c => c.classList.add('is-bonus-card'));

        while (mainDiv.firstChild) mainDiv.parentNode.insertBefore(mainDiv.firstChild, mainDiv);
        while (bonusDiv.firstChild) bonusDiv.parentNode.insertBefore(bonusDiv.firstChild, bonusDiv);

        mainDiv.remove();
        bonusDiv.remove();
    }

    const mainCards = document.querySelectorAll('.is-main-card');
    const bonusCards = document.querySelectorAll('.is-bonus-card');
    const fastestTimeBox = document.getElementById('fastestTimeBox');

    // Force transitions via JS
    mainCards.forEach(card => card.style.transition = 'opacity 0.3s ease-in-out');
    bonusCards.forEach(card => card.style.transition = 'opacity 0.3s ease-in-out');

    const levelSelectCard = levelSelect.closest('.save-item-card');
    if (levelSelectCard) {
        levelSelectCard.style.alignSelf = 'flex-start';
        levelSelectCard.style.height = 'max-content';
    }

    let currentVisibleType = 'main';
    let fadeOutTimeout;

    // Initial setup
    bonusCards.forEach(card => {
        card.style.opacity = '0';
        card.style.display = 'none';
    });

    if (levelSelect.value === 'YoungIndy' && fastestTimeBox) {
        fastestTimeBox.style.display = 'none';
        fastestTimeBox.style.opacity = '0';
    }

    levelSelect.addEventListener('change', function (e) {
        const selectedLevelId = e.target.value;

        updateArtifactUI(selectedLevelId);
        loadArtifactUI(selectedLevelId);

        const data = levelData[selectedLevelId];
        if (!data) return;
        const isYoungIndy = selectedLevelId === 'YoungIndy';

        // 1. Populate inputs INSTANTLY
        if (data.type === 'main') {
            document.getElementById('trueAdventurerInput').checked = data.trueAdventurer;
            document.getElementById('trueAdventurerLegacyInput').checked = data.trueAdventurerLegacy;
            document.getElementById('storyUnlockedInput').checked = data.storyUnlocked;
            document.getElementById('freeplayUnlockedInput').checked = data.freeplayUnlocked;
            document.getElementById('artifactBuiltOrderInput').value = data.artifactBuiltOrder;
            document.getElementById('artifactsCollectedInput').value = data.artifactsCollected;
            document.getElementById('artifactBuiltInput').checked = data.artifactBuilt;
            document.getElementById('parcelPostedInput').checked = data.parcelPosted;
        } else {
            document.getElementById('bonusLevelUnlockedInput').checked = data.unlocked;
            document.getElementById('bonusLevelCompletedInput').checked = data.completed;
            document.getElementById('fastestTimeInput').value = data.fastestTime;
        }

        // 2. Handle Fastest Time Box (Fixes the Young Indy -> Ancient City bug)
        if (fastestTimeBox) {
            if (isYoungIndy || data.type === 'main') {
                fastestTimeBox.style.display = 'none';
                fastestTimeBox.style.opacity = '0';
            } else {
                fastestTimeBox.style.display = '';
                // If we are already in the bonus category, restore opacity immediately
                if (currentVisibleType === data.type) {
                    fastestTimeBox.style.opacity = '1';
                }
            }
        }

        // 3. The Fixed Fade Animation
        if (data.type !== currentVisibleType) {
            clearTimeout(fadeOutTimeout);

            if (data.type === 'bonus') {
                mainCards.forEach(card => card.style.opacity = '0');

                fadeOutTimeout = setTimeout(() => {
                    mainCards.forEach(card => card.style.display = 'none');
                    bonusCards.forEach(card => {
                        // Skip timer box if Young Indy
                        if (isYoungIndy && card.id === 'fastestTimeBox') return;

                        card.style.display = '';
                        void card.offsetWidth;
                        card.style.opacity = '1';
                    });
                }, 300);

            } else {
                bonusCards.forEach(card => card.style.opacity = '0');

                fadeOutTimeout = setTimeout(() => {
                    bonusCards.forEach(card => card.style.display = 'none');
                    mainCards.forEach(card => {
                        card.style.display = '';
                        void card.offsetWidth;
                        card.style.opacity = '1';
                    });
                }, 300);
            }

            currentVisibleType = data.type;
        }
    });
}



const hintsContainer = document.getElementById('hints-container');

hints.forEach((hintText, index) => {
    const label = document.createElement('label');
    label.className = 'hint-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'hint-checkbox';

    const hintId = `hint-${index}`;
    checkbox.dataset.id = hintId;

    // Initialize the starting state
    checkbox.setAttribute('data-state', '0');
    currentState[hintId] = '0';

    // --- NEW: Track individual clicks for history ---
    checkbox.addEventListener('change', function () {
        if (historyConfig.isUndoRedoing) return;

        const newVal = this.checked ? '1' : '0';
        const oldVal = currentState[this.dataset.id];

        if (newVal !== oldVal) {
            undoStack.push({
                type: 'single-hint',
                id: this.dataset.id,
                oldVal: oldVal,
                newVal: newVal
            });

            redoStack.length = 0;
            currentState[this.dataset.id] = newVal;
            this.setAttribute('data-state', newVal);
            updateButtons();
        }
    });

    const textNode = document.createTextNode(hintText);
    label.appendChild(checkbox);
    label.appendChild(textNode);
    hintsContainer.appendChild(label);
});



// Enable All -> State 1 (On)
document.getElementById('enableAllHints').addEventListener('click', () => {
    updateAllHintStates(1);
});

// Disable All -> State 0 (Off)
document.getElementById('disableAllHints').addEventListener('click', () => {
    updateAllHintStates(0);
});




const cheatButtonCharacters = document.getElementById('mobileShiftBypassCharacters');

if (cheatButtonCharacters) {
    cheatButtonCharacters.addEventListener('click', function () {
        // This adds the 'active' class if it's missing, and removes it if it's there
        this.classList.toggle('active');

        // Update the text so it's blatantly obvious
        if (this.classList.contains('active')) {
            this.textContent = 'Cheat code: on';
        } else {
            this.textContent = 'Cheat code: off';
        }
    });
}


const cheatButtonParcels = document.getElementById('mobileShiftBypassParcels');

if (cheatButtonParcels) {
    cheatButtonParcels.addEventListener('click', function () {
        // This adds the 'active' class if it's missing, and removes it if it's there
        this.classList.toggle('active');

        // Update the text so it's blatantly obvious
        if (this.classList.contains('active')) {
            this.textContent = 'Cheat code: on';
        } else {
            this.textContent = 'Cheat code: off';
        }
    });
}





// 1. Create a reusable helper function
function populateDropdown(selectId, dataArray) {
    // Find the dropdown by its ID
    const selectElement = document.getElementById(selectId);

    // Safety check: if the dropdown isn't found, stop here so we don't get errors
    if (!selectElement) return;

    // Find the <optgroup> inside this specific dropdown
    let targetGroup = selectElement.querySelector("optgroup");

    // Fallback: if you ever delete the <optgroup> from HTML, append directly to the <select>
    if (!targetGroup) {
        targetGroup = selectElement;
    }

    // 2. Loop through the given data array
    dataArray.forEach(item => {
        // Create a new <option> element
        let optionElement = document.createElement("option");

        // Set the hidden hex value and the visible text
        optionElement.value = item.value;
        optionElement.textContent = item.text;

        // Add it to the page!
        targetGroup.appendChild(optionElement);
    });
}

// 3. Call the function for every single part
// Make sure the data arrays (hatOptions, hairOptions, etc.) are loaded before this runs!
populateDropdown("hatInput", hatOptions);
populateDropdown("hairInput", hairOptions);
populateDropdown("headInput", headOptions);
populateDropdown("weaponsInput", weaponOptions);
populateDropdown("armsInput", armsOptions);
populateDropdown("handsInput", handsOptions);
populateDropdown("torsoInput", torsoOptions);
populateDropdown("hipsInput", hipsOptions);
populateDropdown("legsInput", legsOptions);




// 1. The "Memory Bank" to store both characters' data
const characterData = {
    1: {
        name: "Stranger 1",
        hatInput: "0x00",
        hairInput: "0x00",
        headInput: "0x00",
        weaponsInput: "0x00",
        armsInput: "0x00",
        handsInput: "0x00",
        torsoInput: "0x00",
        hipsInput: "0x00",
        legsInput: "0x00"
    },
    2: {
        name: "Stranger 2",
        hatInput: "0x00",
        hairInput: "0x00",
        headInput: "0x00",
        weaponsInput: "0x00",
        armsInput: "0x00",
        handsInput: "0x00",
        torsoInput: "0x00",
        hipsInput: "0x00",
        legsInput: "0x00"
    }
};


// Map each dropdown ID to the list of options it uses
const optionsMap = {
    "hatInput": hatOptions,
    "hairInput": hairOptions,
    "headInput": headOptions,
    "weaponsInput": weaponOptions,
    "armsInput": armsOptions,
    "handsInput": handsOptions,
    "torsoInput": torsoOptions,
    "hipsInput": hipsOptions,
    "legsInput": legsOptions
};

// Track which character is currently active on the screen (defaults to 1)
let currentCharacter = 1;

// List of all our input IDs so we don't have to type them a million times
const allDropdownIds = [
    "hatInput", "hairInput", "headInput", "weaponsInput",
    "armsInput", "handsInput", "torsoInput", "hipsInput", "legsInput"
];

// 2. Function to load a character's data into the visible HTML boxes
function loadCharacterToScreen(charId) {
    // Fill the name box
    document.getElementById("characterNameInput").value = characterData[charId].name;

    // Fill all the dropdowns
    allDropdownIds.forEach(id => {
        document.getElementById(id).value = characterData[charId][id];
    });
}

// 3. Listen for Radio Button changes to switch characters
const radioButtons = document.querySelectorAll('input[name="customCharSelect"]');
radioButtons.forEach(radio => {
    radio.addEventListener("change", (e) => {
        // Update our tracker to the new character number (1 or 2)
        currentCharacter = parseInt(e.target.value);
        // Load that character's data onto the screen
        loadCharacterToScreen(currentCharacter);
    });
});
// 1. Listen for the Name changing
document.getElementById("characterNameInput").addEventListener("change", (e) => {
    if (historyConfig.isUndoRedoing) return;

    const oldVal = characterData[currentCharacter].name;
    const newVal = e.target.value;

    if (oldVal !== newVal) {
        undoStack.push({
            type: 'custom-char-single',
            charId: currentCharacter,
            inputId: 'characterNameInput',
            oldVal: oldVal,
            newVal: newVal
        });
        redoStack.length = 0;
        updateButtons();
        characterData[currentCharacter].name = newVal;
    }
});

// 2. Listen for any Dropdown changing
allDropdownIds.forEach(id => {
    document.getElementById(id).addEventListener("change", (e) => {
        if (historyConfig.isUndoRedoing) return;

        const oldVal = characterData[currentCharacter][id];
        const newVal = e.target.value;

        if (oldVal !== newVal) {
            undoStack.push({
                type: 'custom-char-single',
                charId: currentCharacter,
                inputId: id,
                oldVal: oldVal,
                newVal: newVal
            });
            redoStack.length = 0;
            updateButtons();
            characterData[currentCharacter][id] = newVal;
        }
    });
});

// 3. The Randomize Button (Bulk Action)
document.getElementById("randomizeCharacter").addEventListener("click", () => {
    if (historyConfig.isUndoRedoing) return;

    const bulkActions = [];

    allDropdownIds.forEach(id => {
        const optionsArray = optionsMap[id];
        const randomIndex = Math.floor(Math.random() * optionsArray.length);
        const randomHexValue = optionsArray[randomIndex].value;
        const oldVal = characterData[currentCharacter][id];

        // Only save to undo stack if the random value is actually different
        if (oldVal !== randomHexValue) {
            bulkActions.push({
                inputId: id,
                oldVal: oldVal,
                newVal: randomHexValue
            });
            characterData[currentCharacter][id] = randomHexValue;
            document.getElementById(id).value = randomHexValue;
        }
    });

    // Push all randomized changes as a single undo step
    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'custom-char-bulk',
            charId: currentCharacter,
            actions: bulkActions
        });
        redoStack.length = 0;
        updateButtons();
    }
});

// 4. Listen for Undo/Redo commands from history.js
document.addEventListener('restore-custom-char', (e) => {
    const { action, isUndo } = e.detail;

    if (action.type === 'custom-char-single') {
        const valToRestore = isUndo ? action.oldVal : action.newVal;

        // FIX: If the input was the name box, update 'name', otherwise use the ID
        const dataKey = action.inputId === 'characterNameInput' ? 'name' : action.inputId;

        // Update the memory bank for the correct character
        characterData[action.charId][dataKey] = valToRestore;

        // Only update the screen if we are currently looking at that character
        if (currentCharacter === action.charId) {
            document.getElementById(action.inputId).value = valToRestore;
        }
    }
    else if (action.type === 'custom-char-bulk') {
        action.actions.forEach(item => {
            const valToRestore = isUndo ? item.oldVal : item.newVal;

            // Apply the same fix here just to be safe
            const dataKey = item.inputId === 'characterNameInput' ? 'name' : item.inputId;

            characterData[action.charId][dataKey] = valToRestore;

            if (currentCharacter === action.charId) {
                document.getElementById(item.inputId).value = valToRestore;
            }
        });
    }
});


/*
// Grab the dropdown and the two UI panels from your HTML
const levelSelectInput = document.getElementById('levelSelectInput');
const mainLevelsDiv = document.getElementById('mainLevels');
const bonusLevelsDiv = document.getElementById('bonusLevels');

// Listen for when the user picks a new level
levelSelectInput.addEventListener('change', (e) => {
    // 1. Update our tracker to the newly selected level (e.g., "1-2" or "Warehouse")
    currentLevel = e.target.value;
    updateArtifactUI(currentLevel);
    
    // 2. Fetch the saved data for this specific level from your memory bank
    const data = levelData[currentLevel];

    // 3. Toggle panels and fill inputs based on what kind of level it is
    if (data.type === 'main') {
        // Show main level UI, hide bonus UI
        mainLevelsDiv.style.display = 'block';
        bonusLevelsDiv.style.display = 'none';

        // 4. Inject the memory bank data back into the text boxes and checkboxes
        document.getElementById('trueAdventurerInput').checked = data.trueAdventurer;
        document.getElementById('trueAdventurerLegacyInput').checked = data.trueAdventurerLegacy;
        document.getElementById('storyUnlockedInput').checked = data.storyUnlocked;
        document.getElementById('freeplayUnlockedInput').checked = data.freeplayUnlocked;
        document.getElementById('artifactBuiltOrderInput').value = data.artifactBuiltOrder;
        document.getElementById('artifactsCollectedInput').value = data.artifactsCollected;
        document.getElementById('artifactBuiltInput').checked = data.artifactBuilt;
        document.getElementById('parcelPostedInput').checked = data.parcelPosted;
        
    } else if (data.type === 'bonus') {
        // Hide main level UI, show bonus UI
        mainLevelsDiv.style.display = 'none';
        bonusLevelsDiv.style.display = 'block';

        // 4. Inject the memory bank data back into the bonus level inputs
        document.getElementById('bonusLevelUnlockedInput').checked = data.unlocked;
        document.getElementById('bonusLevelCompletedInput').checked = data.completed;
        document.getElementById('fastestTimeInput').value = data.fastestTime;
    }
});


*/





// --- Global Helper Function to Refresh the UI ---
function refreshCurrentLevelUI() {
    const currentLevelId = document.getElementById('levelSelectInput').value;

    updateArtifactUI(currentLevelId);
    loadArtifactUI(currentLevelId);

    const data = levelData[currentLevelId];

    if (!data) return;

    if (data.type === 'main') {
        document.getElementById('trueAdventurerInput').checked = data.trueAdventurer;
        document.getElementById('trueAdventurerLegacyInput').checked = data.trueAdventurerLegacy;
        document.getElementById('storyUnlockedInput').checked = data.storyUnlocked;
        document.getElementById('freeplayUnlockedInput').checked = data.freeplayUnlocked;
        document.getElementById('artifactsCollectedInput').value = data.artifactsCollected;
        document.getElementById('artifactBuiltInput').checked = data.artifactBuilt;
        document.getElementById('parcelPostedInput').checked = data.parcelPosted;
    } else {
        document.getElementById('bonusLevelUnlockedInput').checked = data.unlocked;
        document.getElementById('bonusLevelCompletedInput').checked = data.completed;
    }
}




// --- 1. Finish All Story ---
document.getElementById('finishAllStory')?.addEventListener('click', () => {
    for (const id in levelData) {
        if (levelData[id].type === 'main') {
            levelData[id].storyUnlocked = true;
            levelData[id].freeplayUnlocked = true;
        }
    }
    refreshCurrentLevelUI();
});

// --- 2. Finish All Bonus ---
document.getElementById('finishAllBonus')?.addEventListener('click', () => {
    for (const id in levelData) {
        if (levelData[id].type === 'bonus') {
            levelData[id].unlocked = true;
            levelData[id].completed = true;
            levelData[id].fastestTime = 4294967295;
        }
    }
    refreshCurrentLevelUI();
});

// --- 3. All Artifacts ---
document.getElementById('collectAllArtifacts')?.addEventListener('click', () => {
    for (const id in levelData) {
        if (levelData[id].type === 'main') {
            levelData[id].artifactsCollected = 10;
            levelData[id].artifactBuilt = true;
        }
    }
    refreshCurrentLevelUI();
});

// --- 3.5 All Artifacts (level) ---
document.getElementById('collectAllArtifactsLevel')?.addEventListener('click', () => {
    checkFirstArtifactPieces();
    refreshCurrentLevelUI();
});



// --- 4. All Parcels ---
document.getElementById('collectAllParcels')?.addEventListener('click', () => {
    for (const id in levelData) {
        if (levelData[id].type === 'main') levelData[id].parcelPosted = true;
    }
    refreshCurrentLevelUI();
});

// --- 5. All True Adventurers ---
document.getElementById('collectAllTrueAdventurer')?.addEventListener('click', () => {
    for (const id in levelData) {
        if (levelData[id].type === 'main') {
            levelData[id].trueAdventurer = true;
            levelData[id].trueAdventurerLegacy = true;
        }
    }
    refreshCurrentLevelUI();
});

// --- 6. Unlock Everything (The Nuke) ---
document.getElementById('finishAllLevels')?.addEventListener('click', () => {
    for (const id in levelData) {
        if (levelData[id].type === 'main') {
            levelData[id].storyUnlocked = true;
            levelData[id].freeplayUnlocked = true;
            levelData[id].trueAdventurer = true;
            levelData[id].trueAdventurerLegacy = true;
            levelData[id].artifactsCollected = 10;
            levelData[id].artifactBuilt = true;
            levelData[id].parcelPosted = true;
            
            
        } else {
            levelData[id].unlocked = true;
            levelData[id].completed = true;

        }
    }
    checkFirstArtifactPieces();
    refreshCurrentLevelUI();
});

// --- 7. Reset All (Start from Scratch) ---
document.getElementById('resetAllLevels')?.addEventListener('click', () => {


    for (const id in levelData) {
        if (levelData[id].type === 'main') {
            levelData[id].storyUnlocked = false;
            levelData[id].freeplayUnlocked = false;
            levelData[id].trueAdventurer = false;
            levelData[id].trueAdventurerLegacy = false;
            levelData[id].artifactsCollected = 0;
            levelData[id].artifactBuilt = false;
            levelData[id].parcelPosted = false;
            levelData[id].artifactBuiltOrder = 0;
            levelData[id].individualArtifactsCollected = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
        } else {
            levelData[id].unlocked = false;
            levelData[id].completed = false;
            
        }
    }

    refreshCurrentLevelUI();
});


export function updateArtifactUI(levelId) {
    // 1. SAFETY CHECK: Skip non-main levels like "YoungIndy"
    if (!levelId.includes('-')) {
        return;
    }

    const [episode, chapter] = levelId.split('-').map(Number);
    const levelIndex = ((episode - 1) * 6) + (chapter - 1);
    const baseArtifactNum = levelIndex * 10;

    // Grab the blueprint for this specific level (fallback to all 1s if missing)
    const currentLevelDupes = artifactDupeCounts[levelId] || Array(10).fill(1);

    for (let i = 1; i <= 10; i++) {
        // --- 1. IMAGE UPDATING ---
        const globalArtifactNum = baseArtifactNum + i;
        const imgElement = document.getElementById(`art${i}_img`);
        if (imgElement) {
            imgElement.src = `resources/artifacts/${levelId}/artifact${globalArtifactNum}.png`;
        }

        // --- 2. CHECKBOX HIDING/SHOWING ---
        // Get how many pieces this specific artifact has (Array is 0-indexed, so i-1)
        const numPieces = currentLevelDupes[i - 1];

        // Loop through all 5 possible hardcoded checkboxes for this specific artifact
        for (let j = 1; j <= 5; j++) {
            const checkbox = document.getElementById(`art${i}_dupe${j}`);

            if (checkbox) {
                if (j <= numPieces) {
                    // Show the checkbox if it's within the required amount
                    // (Use 'inline-block' or '' to reset to default CSS)
                    checkbox.style.display = 'inline-block';
                } else {
                    // Hide the extra checkboxes
                    checkbox.style.display = 'none';
                    // Safety feature: uncheck it so hidden boxes don't accidentally get saved
                    checkbox.checked = false;
                }
            }
        }
    }
}

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('art-cb')) {
        // Find out which level we are currently on
        const currentLevel = document.getElementById('levelSelectInput').value; // adjust if your variable is different
        const data = levelData[currentLevel];
        if (!data) return;

        // Create the 2D array if this level doesn't have one yet
        if (!data.individualArtifactsCollected) {
            data.individualArtifactsCollected = Array.from({ length: 10 }, () => Array(5).fill(0));
        }

        // Extract the numbers from IDs like "art3_dupe2"
        const match = e.target.id.match(/art(\d+)_dupe(\d+)/);
        if (match) {
            const artIndex = parseInt(match[1], 10) - 1;   // Converts 1-10 to 0-9 for the array
            const pieceIndex = parseInt(match[2], 10) - 1; // Converts 1-5 to 0-4 for the array

            // If checked, save a 1. If unchecked, save a 0.
            data.individualArtifactsCollected[artIndex][pieceIndex] = e.target.checked ? 1 : 0;
        }
    }
});


function loadArtifactUI(currentLevel) {
    const data = levelData[currentLevel];
    if (!data) return;

    // Safety net: give them a blank array if they haven't clicked anything yet
    const collectedArray = data.individualArtifactsCollected || Array.from({ length: 10 }, () => Array(5).fill(0));

    for (let art = 1; art <= 10; art++) {
        for (let dupe = 1; dupe <= 5; dupe++) {
            const checkbox = document.getElementById(`art${art}_dupe${dupe}`);
            if (checkbox) {
                // Read the array. If it's a 1, check the box. If 0, uncheck.
                checkbox.checked = collectedArray[art - 1][dupe - 1] === 1;
            }
        }
    }
}

    
function checkFirstArtifactPieces() {
    // 1. Loop through EVERY level in your memory bank
    for (const levelId in levelData) {
        const data = levelData[levelId];

        // 2. Only apply this to main levels
        if (data.type === 'main') {
            
            // Safety net: Create the 2D array if they haven't clicked anything yet
            if (!data.individualArtifactsCollected) {
                data.individualArtifactsCollected = Array.from({ length: 10 }, () => Array(5).fill(0));
            }

            // 3. Update the memory bank for all 10 artifacts
            // (Looping 0 to 9 to match the array indexes)
            for (let i = 0; i < 10; i++) {
                data.individualArtifactsCollected[i][0] = 1; // 0 is the first piece
            }
        }
    }
    // 4. Finally, refresh the UI for whatever level is currently on the screen
    const currentLevel = document.getElementById('levelSelectInput').value;
    if (typeof loadArtifactUI === "function") {
        loadArtifactUI(currentLevel);
    }
}