import { characterFiles, nonBuyableCharacters, storyCharacters } from "./characterfiles.js";
import { undoStack, redoStack, currentState, historyConfig, updateButtons } from "./history.js";

export function initCharacterGrid() {
    const gridContainer = document.getElementById('rosterGrid');
    if (!gridContainer || typeof characterFiles === 'undefined') return;

    let isDragging = false;
    let dragDirection = 0; 
    let draggedSet = new Set(); 
    let currentStrokeActions = []; 

    // Helper function to handle ending a drag cleanly
    const stopDrag = () => {
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
    };

    // Swapped to pointerdown
    document.addEventListener('pointerdown', (e) => {
        if (e.button === 0) { isDragging = true; dragDirection = 1; }
        else if (e.button === 2) { isDragging = true; dragDirection = -1; }
    });

    // Swapped to pointerup, and added pointercancel for mobile interruptions
    document.addEventListener('pointerup', stopDrag);
    document.addEventListener('pointercancel', stopDrag);

    const handleInteraction = (element, direction, SHIFT=false) => {
        if (historyConfig.isUndoRedoing) return;
        if (draggedSet.has(element.dataset.id)) return; 

        draggedSet.add(element.dataset.id);
        let oldState = element.dataset.state;
        let newState;

        if (nonBuyableCharacters.includes(element.dataset.fileName)) {
            newState = (parseInt(oldState) + direction + 2) % 2;
        } else {
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

        // Swapped to pointerdown
        slot.addEventListener('pointerdown', (e) => {
            e.preventDefault(); 
            
            // CRITICAL FOR MOBILE: This tells the browser to stop locking the touch event 
            // to this single element, allowing 'pointerenter' to fire on neighbors!
            if (slot.hasPointerCapture(e.pointerId)) {
                slot.releasePointerCapture(e.pointerId);
            }

            let dir = (e.button === 2) ? -1 : 1;
            handleInteraction(slot, dir, e.shiftKey);
        });

        // Swapped to pointerenter
        slot.addEventListener('pointerenter', (e) => {
            if (!isDragging) return;
            handleInteraction(slot, dragDirection, e.shiftKey);
        });

        slot.addEventListener('contextmenu', (e) => e.preventDefault());

        gridContainer.appendChild(slot);
    });
}


// Function to update all character states
function updateAllCharacterStates(newState) {
    if (historyConfig.isUndoRedoing) return;

    const allSlots = document.querySelectorAll('.char-slot');
    const bulkActions = [];
    
    allSlots.forEach(slot => {
        const oldState = slot.dataset.state;
        let targetState = String(newState);

        if (nonBuyableCharacters.includes(slot.dataset.fileName) && newState == 2) {
            targetState = '1';
        }

        if (oldState !== targetState) {
            const slotId = slot.dataset.id;

            bulkActions.push({
                id: slotId,
                oldVal: oldState,
                newVal: targetState
            });

            slot.setAttribute('data-state', targetState);
            
            if (slotId) {
                currentState[slotId] = targetState;
            }
        }
    });

    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'bulk-character',
            actions: bulkActions
        });

        redoStack.length = 0; 
        updateButtons();
        
        console.log(`Mass updated ${bulkActions.length} characters.`);
    } else {
        console.log(`All characters were already at target state.`);
    }
}


function unlockStoryCharacters() {
    if (historyConfig.isUndoRedoing) return;

    const allSlots = document.querySelectorAll('.char-slot');
    const bulkActions = [];
    const targetState = '1'; 
    
    allSlots.forEach(slot => {
        const fileName = slot.dataset.fileName;
        
        if (storyCharacters.includes(fileName)) {
            const oldState = slot.dataset.state;

            if (oldState !== targetState) {
                const slotId = slot.dataset.id;

                bulkActions.push({
                    id: slotId,
                    oldVal: oldState,
                    newVal: targetState
                });

                slot.setAttribute('data-state', targetState);
                
                if (slotId) {
                    currentState[slotId] = targetState;
                }
            }
        }
    });

    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'bulk-character',
            actions: bulkActions
        });

        redoStack.length = 0; 
        updateButtons();
        
        console.log(`Unlocked ${bulkActions.length} story characters.`);
    } else {
        console.log("All story characters are already unlocked.");
    }
}

// Event Listeners for the buttons
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('unlockAllChars')?.addEventListener('click', () => updateAllCharacterStates(1));
    document.getElementById('shopAllChars')?.addEventListener('click', () => updateAllCharacterStates(2));
    document.getElementById('resetAllChars')?.addEventListener('click', () => updateAllCharacterStates(0));
    document.getElementById('unlockStoryChars')?.addEventListener('click', unlockStoryCharacters);
});