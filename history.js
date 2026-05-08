export const undoStack = [];
export const redoStack = [];
export const currentState = {}; 

// Using an object for state allows imported files to read the live boolean
export const historyConfig = { isUndoRedoing: false };



export function initHistory() {
    const allInputs = document.querySelectorAll('.save-item-card input:not(.no-undo), .save-item-card select:not(.no-undo)');

    allInputs.forEach(input => {
        if (input.id) {
            currentState[input.id] = input.type === 'checkbox' ? input.checked : input.value;

            input.addEventListener('change', function () {
                if (historyConfig.isUndoRedoing) return; 

                const newVal = this.type === 'checkbox' ? this.checked : this.value;
                const oldVal = currentState[this.id];

                if (newVal !== oldVal) {
                    undoStack.push({ id: this.id, type: this.type, oldVal: oldVal, newVal: newVal });
                    redoStack.length = 0; 
                    currentState[this.id] = newVal;
                    updateButtons();
                }
            });
        }
    });

    const speedrunnerBox = document.getElementById('speedrunnerModeInput');
    if (speedrunnerBox) {
        speedrunnerBox.addEventListener('click', function (e) {
            if (!this.checked) {
                const userConfirmed = confirm("Are you sure you want to disable Speedrunner mode?\n\nThis will allow edits that cannot be achieved through normal gameplay. Submitting runs on an impossible file will lead to your run being invalid.");
                if (!userConfirmed) e.preventDefault(); 
            }
        });
    }

    // Hotkeys & Buttons
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault(); 
                undo();
            }
            if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
                e.preventDefault();
                redo();
            }
        }
    });

    const globalUndoBtn = document.getElementById('globalUndoBtn');
    const globalRedoBtn = document.getElementById('globalRedoBtn');

    if (globalUndoBtn) {
        globalUndoBtn.addEventListener('click', e => { e.preventDefault(); undo(); });
    }
    if (globalRedoBtn) {
        globalRedoBtn.addEventListener('click', e => { e.preventDefault(); redo(); });
    }
}

export function undo() {
    if (undoStack.length === 0) return;

    historyConfig.isUndoRedoing = true;
    const action = undoStack.pop();

    const input = document.getElementById(action.id);
    const charSlot = document.querySelector(`.char-slot[data-id="${action.id}"]`);

    if (action.type === 'bulk-character') {
        action.actions.forEach(item => {
            const slot = document.querySelector(`.char-slot[data-id="${item.id}"]`);
            if (slot) {
                slot.dataset.state = item.oldVal;
                currentState[item.id] = item.oldVal;
            }
        });
    }
    else if (action.type === 'character' && charSlot) {
        charSlot.dataset.state = action.oldVal; 
        currentState[action.id] = action.oldVal;
    }
    // Inside undo() and redo()
    else if (action.type === 'parcel') {
        const parcelBtn = document.getElementById(action.id);
        if (parcelBtn) {
            // Use action.oldVal for undo(), action.newVal for redo()
            parcelBtn.dataset.state = action.oldVal; 
            currentState[action.id] = action.oldVal;
        }
    }
    else if (input) {
        if (action.type === 'checkbox') input.checked = action.oldVal;
        else input.value = action.oldVal;

        currentState[action.id] = action.oldVal;
        input.dispatchEvent(new Event('change'));
    }

    redoStack.push(action);
    historyConfig.isUndoRedoing = false;
    updateButtons();
}

export function redo() {
    if (redoStack.length === 0) return;

    historyConfig.isUndoRedoing = true;
    const action = redoStack.pop();

    const input = document.getElementById(action.id);
    const charSlot = document.querySelector(`.char-slot[data-id="${action.id}"]`);

    if (action.type === 'bulk-character') {
        action.actions.forEach(item => {
            const slot = document.querySelector(`.char-slot[data-id="${item.id}"]`);
            if (slot) {
                slot.dataset.state = item.newVal;
                currentState[item.id] = item.newVal;
            }
        });
    }
    else if (action.type === 'character' && charSlot) {
        charSlot.dataset.state = action.newVal;
        currentState[action.id] = action.newVal;
    }
    // NEW: Handle Parcel Redo
    else if (action.type === 'parcel') {
        const parcelBtn = document.getElementById(action.id);
        if (parcelBtn) {
            parcelBtn.dataset.state = action.newVal;
            const textElement = parcelBtn.querySelector('.status-text');
            if (textElement) textElement.textContent = PARCEL_STATES[action.newVal];
            currentState[action.id] = action.newVal;
        }
    }
    else if (input) {
        if (action.type === 'checkbox') input.checked = action.newVal;
        else input.value = action.newVal;

        currentState[action.id] = action.newVal;
        input.dispatchEvent(new Event('change'));
    }

    undoStack.push(action);
    historyConfig.isUndoRedoing = false;
    updateButtons();
}

export function updateButtons() {
    const undoBtn = document.getElementById('globalUndoBtn');
    const redoBtn = document.getElementById('globalRedoBtn');

    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}