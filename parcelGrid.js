import { parcels, defaultParcels } from "./parcelfiles.js";
import { undoStack, redoStack, currentState, historyConfig, updateButtons } from "./history.js";

const parcelContainer = document.getElementById('parcel-container');

export function applyParcelState(id, newState) {
    const btn = document.getElementById(id);
    if (!btn) return;
    
    // Just update the data attribute; CSS handles all the fading
    btn.dataset.state = newState;
    currentState[id] = newState.toString(); 
}

export function initParcelGrid() {
    let isDragging = false;
    let dragDirection = 0; 
    let draggedSet = new Set(); 
    let currentStrokeActions = []; 

    // Helper function to stop drag cleanly
    const stopDrag = () => {
        if (isDragging && currentStrokeActions.length > 0) {
            undoStack.push({
                type: 'bulk-parcel', 
                actions: [...currentStrokeActions]
            });
            redoStack.length = 0;
            if (typeof updateButtons === 'function') updateButtons();
        }
        isDragging = false;
        draggedSet.clear();
        currentStrokeActions = [];
    };

    // 1. Global Document Listeners for dragging (Swapped to pointer)
    document.addEventListener('pointerdown', (e) => {
        // Only trigger drag if we are actually clicking a parcel button
        if (e.target.closest('.parcel-btn')) {
            if (e.button === 0) { isDragging = true; dragDirection = 1; }
            else if (e.button === 2) { isDragging = true; dragDirection = -1; }
        }
    });

    // Swapped to pointerup and added pointercancel for mobile interruptions
    document.addEventListener('pointerup', stopDrag);
    document.addEventListener('pointercancel', stopDrag);

    // 2. Main Interaction Logic
    const handleInteraction = (btn, parcelId, direction, SHIFT=false) => {
        if (historyConfig && historyConfig.isUndoRedoing) return;
        if (draggedSet.has(parcelId)) return; // Don't trigger the same button twice in one drag

        draggedSet.add(parcelId);

        let oldState = parseInt(btn.dataset.state);
        let nextState;

        let isDefaultParcel = defaultParcels.includes(parcelId);

        if (isDefaultParcel) {
            if (oldState == 1) {
                nextState = 2;
            } else {
                nextState = 1;
            }
        } else {
            nextState = (oldState + direction + 3) % 3;
        }
        
        const cheatButton = document.getElementById('mobileShiftBypassParcels');
    
        // This will return true if it's ON, and false if it's OFF
        const isCheatActive = cheatButton && cheatButton.classList.contains('active');

        // Cheat code red bypass
        if (SHIFT || isCheatActive) {
            if (oldState == 3) {
                if (isDefaultParcel) {
                    nextState = 2;
                } else {
                    nextState = 0;
                }
            } else {
                nextState = 3;
            }
        }

        // Apply the visual state and update the global currentState object
        applyParcelState(parcelId, nextState);

        // Queue it up for the bulk history payload instead of pushing immediately
        currentStrokeActions.push({
            id: parcelId,
            oldVal: oldState.toString(),
            newVal: nextState.toString()
        });
    };

    // 3. Generate the Buttons
    parcels.forEach(parcel => {
        const startingState = currentState[parcel.id] !== undefined ? currentState[parcel.id] : '0';

        const btn = document.createElement('button');
        btn.className = 'parcel-btn';
        btn.id = parcel.id;
        btn.dataset.id = parcel.id; // Added this so updateAllParcelStates can read it!
        btn.dataset.state = startingState;

        if (defaultParcels.includes(parcel.id)) {
            btn.dataset.state = 2;
        }
        
        btn.innerHTML = `
            <img src="${parcel.image}" class="status-icon" alt="${parcel.name}" draggable="false">
            <span class="status-text">${parcel.name}</span>
        `;

        // Swapped to pointerdown
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault(); 
            
            // CRITICAL FOR MOBILE: Tells the browser to stop locking the touch event 
            // to this single element, allowing 'pointerenter' to fire on neighbors!
            if (btn.hasPointerCapture(e.pointerId)) {
                btn.releasePointerCapture(e.pointerId);
            }

            let dir = (e.button === 2) ? -1 : 1;
            handleInteraction(btn, parcel.id, dir, e.shiftKey);
        });

        // Swapped to pointerenter
        btn.addEventListener('pointerenter', (e) => {
            if (!isDragging) return;
            handleInteraction(btn, parcel.id, dragDirection, e.shiftKey);
        });

        // Stop the browser from opening the right-click menu
        btn.addEventListener('contextmenu', (e) => e.preventDefault());

        parcelContainer.appendChild(btn);
    });
}


// Unlock All Parcels -> State 1 (Active/Bright border)
document.getElementById('unlockAllParcels')?.addEventListener('click', () => {
    updateAllParcelStates(1); 
});

// Shop All Parcels -> State 2 (Found/Warmer border)
document.getElementById('shopAllParcels')?.addEventListener('click', () => {
    updateAllParcelStates(2); 
});

// Reset All Parcels -> State 0 (Locked/Dimmed)
document.getElementById('resetAllParcels')?.addEventListener('click', () => {
    updateAllParcelStates(0); 
});


// Function to update all parcel states
function updateAllParcelStates(newState) {
    // If history is currently running, don't interfere
    if (historyConfig.isUndoRedoing) return;

    const allParcels = document.querySelectorAll('.parcel-btn');
    const bulkActions = [];
    
    allParcels.forEach((parcel, index) => {
        const oldState = parcel.dataset.state;
        let targetState = String(newState);

        // ENFORCE RULE: The first six parcels are always unlocked.
        // If the user clicks "Reset All" (0) or "Shop All" (2), force the first 6 to stay Active (1).
        if (index < 6 && (newState == 0 || newState == 2)) {
            targetState = '2'; 
        }

        // Only record and update if the state is actually changing
        if (oldState !== targetState) {
            const parcelId = parcel.dataset.id; 

            // 1. Push to our history payload
            bulkActions.push({
                id: parcelId,
                oldVal: oldState,
                newVal: targetState
            });

            // 2. Update the DOM data attribute
            parcel.setAttribute('data-state', targetState);
            
            // 3. Update the global history current state object
            if (parcelId) {
                currentState[parcelId] = targetState;
            }
        }
    });

    // If any parcels actually changed, push the bulk action to the history stack
    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'bulk-parcel', 
            actions: bulkActions
        });

        // Clear the redo stack because a new manual action was taken
        redoStack.length = 0; 
        
        // Update the Undo/Redo buttons to be clickable
        if (typeof updateButtons === 'function') updateButtons();
        
        console.log(`Mass updated ${bulkActions.length} parcels.`);
    } else {
        console.log(`All parcels were already at target state.`);
    }
}