import { parcels } from "./parcelfiles.js";
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
    parcels.forEach(parcel => {
        const startingState = currentState[parcel.id] !== undefined ? currentState[parcel.id] : '0';

        // Build the button directly (No row wrapper needed)
        const btn = document.createElement('button');
        btn.className = 'parcel-btn';
        btn.id = parcel.id;
        btn.dataset.state = startingState;
        
        // Icon on the left, Name on the right
        btn.innerHTML = `
            <img src="${parcel.image}" class="status-icon" alt="${parcel.name}" draggable="false">
            <span class="status-text">${parcel.name}</span>
        `;

        // Main Interaction Logic
        const handleInteraction = (e, direction, CTRL) => {
            e.preventDefault(); 
            if (historyConfig && historyConfig.isUndoRedoing) return;

            let oldState = parseInt(btn.dataset.state);
            let nextState = (oldState + direction + 3) % 3;
            
            // Cheat code red bypass
            if (CTRL) {
                if (oldState == 3) {
                    nextState = 0;
                } else {
                    nextState = 3;
                }
            }


            applyParcelState(parcel.id, nextState);

            undoStack.push({
                type: 'parcel',
                id: parcel.id,
                oldVal: oldState.toString(),
                newVal: nextState.toString()
            });

            redoStack.length = 0;
            if (typeof updateButtons === 'function') updateButtons();
        };

        btn.addEventListener('click', (e) => handleInteraction(e, 1, e.ctrlKey));
        btn.addEventListener('contextmenu', (e) => handleInteraction(e, -1, e.ctrlKey));

        parcelContainer.appendChild(btn);
    });
}

