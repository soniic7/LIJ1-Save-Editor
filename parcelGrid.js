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

    // 1. Global Document Listeners for dragging
    document.addEventListener('mousedown', (e) => {
        // Only trigger drag if we are actually clicking a parcel button
        if (e.target.closest('.parcel-btn')) {
            if (e.button === 0) { isDragging = true; dragDirection = 1; }
            else if (e.button === 2) { isDragging = true; dragDirection = -1; }
        }
    });

    document.addEventListener('mouseup', () => {
        // Bundle the whole drag stroke into one history action
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
    });

    // 2. Main Interaction Logic
    const handleInteraction = (btn, parcelId, direction, CTRL) => {
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
        
        
        // Cheat code red bypass
        if (CTRL) {
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
        btn.dataset.state = startingState;

        if (defaultParcels.includes(parcel.id)) {
            btn.dataset.state = 2;
        }
        
        btn.innerHTML = `
            <img src="${parcel.image}" class="status-icon" alt="${parcel.name}" draggable="false">
            <span class="status-text">${parcel.name}</span>
        `;

        // Start dragging
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            let dir = (e.button === 2) ? -1 : 1;
            handleInteraction(btn, parcel.id, dir, e.ctrlKey);
        });

        // Continue dragging over new buttons
        btn.addEventListener('mouseenter', (e) => {
            if (!isDragging) return;
            handleInteraction(btn, parcel.id, dragDirection, e.ctrlKey);
        });

        // Stop the browser from opening the right-click menu
        btn.addEventListener('contextmenu', (e) => e.preventDefault());

        parcelContainer.appendChild(btn);
    });
}