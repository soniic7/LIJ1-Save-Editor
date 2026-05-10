import { characterFiles, nonBuyableCharacters, storyCharacters } from "./characterfiles.js";
import { undoStack, redoStack, currentState, historyConfig, updateButtons } from "./history.js";

export function initCharacterGrid() {
    const gridContainer = document.getElementById('rosterGrid');
    if (!gridContainer || typeof characterFiles === 'undefined') return;

    let isDragging = false;
    let dragDirection = 0; 
    let draggedSet = new Set(); 
    let currentStrokeActions = []; 

    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) { isDragging = true; dragDirection = 1; }
        else if (e.button === 2) { isDragging = true; dragDirection = -1; }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging && currentStrokeActions.length > 0) {
            undoStack.push({
                type: 'bulk-character',
                actions: [...currentStrokeActions]
            });
            redoStack.length = 0;
            updateButtons();
        }
        isDragging = false;
        draggedSet.clear();
        currentStrokeActions = [];
    });

    const handleInteraction = (element, direction, SHIFT=false) => {
        if (historyConfig.isUndoRedoing) return;
        if (draggedSet.has(element.dataset.id)) return; 

        draggedSet.add(element.dataset.id);
        let oldState = element.dataset.state;
        let newState;

        if (nonBuyableCharacters.includes(element.dataset.fileName)) {
            newState = (parseInt(oldState) + direction + 2) % 2;
        } else{
            newState = (parseInt(oldState) + direction + 3) % 3;
        }

        const cheatButton = document.getElementById('mobileShiftBypassCharacters');
    
        // This will return true if it's ON, and false if it's OFF
        const isCheatActive = cheatButton && cheatButton.classList.contains('active');
        // Override state to SHIFT state (cheat code red border)
        if (SHIFT || isCheatActive) {
            if (oldState == 3) {
                newState = 0;
            } else {
                newState = 3;
            }
        }

        element.dataset.state = newState.toString();
        currentState[element.dataset.id] = newState.toString();

        currentStrokeActions.push({
            id: element.dataset.id,
            oldVal: oldState,
            newVal: newState.toString()
        });
    };

    characterFiles.forEach((charName) => {
        const slot = document.createElement('div');
        slot.className = 'char-slot';

        const cleanId = charName.replace(/^\d+_/, '');
        slot.dataset.fileName = charName;
        slot.dataset.id = cleanId;
        slot.dataset.state = '0';
        slot.title = cleanId.replace('ICON_', '').replace(/_/g, ' ');

        slot.innerHTML = `
            <img src="./resources/icons/characters/${charName}.png" class="char-face" alt="${cleanId}" draggable="false">
            <img src="./resources/icons/borders/brownborder.png" class="char-border" alt="border" draggable="false">
        `;

        slot.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            let dir = (e.button === 2) ? -1 : 1;
            handleInteraction(slot, dir, e.shiftKey);
        });

        slot.addEventListener('mouseenter', (e) => {
            if (!isDragging) return;
            handleInteraction(slot, dragDirection, e.shiftKey);
        });

        slot.addEventListener('contextmenu', (e) => e.preventDefault());

        gridContainer.appendChild(slot);
    });
}


// Function to update all character states
function updateAllCharacterStates(newState) {
    // If history is currently running, don't interfere
    if (historyConfig.isUndoRedoing) return;

    const allSlots = document.querySelectorAll('.char-slot');
    const bulkActions = [];
    
    allSlots.forEach(slot => {
        const oldState = slot.dataset.state;
        let targetState = String(newState);

        // Ignoring non-shoppable characters (forces them to state 1 instead of 2)
        if (nonBuyableCharacters.includes(slot.dataset.fileName) && newState == 2) {
            targetState = '1';
        }

        // Only record and update if the state is actually changing
        if (oldState !== targetState) {
            const slotId = slot.dataset.id;

            // 1. Push to our history payload
            bulkActions.push({
                id: slotId,
                oldVal: oldState,
                newVal: targetState
            });

            // 2. Update the DOM data attribute
            slot.setAttribute('data-state', targetState);
            
            // 3. Update the global history current state object
            if (slotId) {
                currentState[slotId] = targetState;
            }
        }
    });

    // If any characters actually changed, push the bulk action to the history stack
    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'bulk-character',
            actions: bulkActions
        });

        // Clear the redo stack because a new manual action was taken
        redoStack.length = 0; 
        
        // Update the Undo/Redo buttons to be clickable
        updateButtons();
        
        console.log(`Mass updated ${bulkActions.length} characters.`);
    } else {
        console.log(`All characters were already at target state.`);
    }
}


function unlockStoryCharacters() {
    // Prevent interference if history is actively moving
    if (historyConfig.isUndoRedoing) return;

    const allSlots = document.querySelectorAll('.char-slot');
    const bulkActions = [];
    const targetState = '1'; // Story characters bypass the shop (state 2) and go straight to unlocked (1)
    
    allSlots.forEach(slot => {
        const fileName = slot.dataset.fileName;
        
        // Only modify the character if it exists in your story list
        if (storyCharacters.includes(fileName)) {
            const oldState = slot.dataset.state;

            // Only record and update if they aren't already unlocked
            if (oldState !== targetState) {
                const slotId = slot.dataset.id;

                // Push to the history payload
                bulkActions.push({
                    id: slotId,
                    oldVal: oldState,
                    newVal: targetState
                });

                // Update the visual DOM state
                slot.setAttribute('data-state', targetState);
                
                // Update the global history state object
                if (slotId) {
                    currentState[slotId] = targetState;
                }
            }
        }
    });

    // If any story characters were actually unlocked, push to the undo stack
    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'bulk-character',
            actions: bulkActions
        });

        // Clear redo stack on new manual action
        redoStack.length = 0; 
        updateButtons();
        
        console.log(`Unlocked ${bulkActions.length} story characters.`);
    } else {
        console.log("All story characters are already unlocked.");
    }
}



// Event Listeners for the buttons (using optional chaining ?. to prevent null errors)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('unlockAllChars')?.addEventListener('click', () => updateAllCharacterStates(1));
    document.getElementById('shopAllChars')?.addEventListener('click', () => updateAllCharacterStates(2));
    document.getElementById('resetAllChars')?.addEventListener('click', () => updateAllCharacterStates(0));
    document.getElementById('unlockStoryChars')?.addEventListener('click', unlockStoryCharacters);
});