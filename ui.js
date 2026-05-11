import { validPercents } from "./validpercentages.js";
import { hints, updateAllHintStates } from "./hints.js";
import { currentState, historyConfig, undoStack, redoStack, updateButtons } from './history.js';
import { hatOptions, hairOptions, headOptions, 
    weaponOptions, armsOptions, handsOptions, 
    torsoOptions, hipsOptions, legsOptions } from './characterParts.js';

export function initUI() {
    initTabs();
    initPercentageSnap();
    initLevelSelect();
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
    const mainDiv = document.getElementById('mainLevels');
    const bonusDiv = document.getElementById('bonusLevels');
    
    if (!levelSelect || !mainDiv || !bonusDiv) return;

    const mainCards = mainDiv.querySelectorAll('.save-item-card');
    const bonusCards = bonusDiv.querySelectorAll('.save-item-card');
    const fastestTimeBox = document.getElementById('fastestTimeBox');

    bonusCards.forEach(card => card.style.opacity = '0');

    if (levelSelect.value === 'YoungIndy' && fastestTimeBox) {
        fastestTimeBox.style.display = 'none';
    }

    levelSelect.addEventListener('change', function () {
        const bonusValues = ['YoungIndy', 'AncientCity', 'Warehouse'];
        const isYoungIndy = this.value === 'YoungIndy';

        if (isYoungIndy && fastestTimeBox) {
            fastestTimeBox.style.opacity = '0';
        }

        if (bonusValues.includes(this.value)) {
            mainCards.forEach(card => card.style.opacity = '0');

            setTimeout(() => {
                mainDiv.style.display = 'none';
                bonusDiv.style.display = 'contents';

                if (fastestTimeBox) {
                    fastestTimeBox.style.display = isYoungIndy ? 'none' : 'flex';
                }

                setTimeout(() => {
                    bonusCards.forEach(card => {
                        if (isYoungIndy && card === fastestTimeBox) return;
                        card.style.opacity = '1';
                    });
                }, 10);
            }, 400);

        } else {
            bonusCards.forEach(card => card.style.opacity = '0');

            setTimeout(() => {
                bonusDiv.style.display = 'none';
                mainDiv.style.display = 'contents';

                if (fastestTimeBox) fastestTimeBox.style.display = 'flex';

                setTimeout(() => {
                    mainCards.forEach(card => card.style.opacity = '1');
                }, 10);
            }, 400);
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