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

    else if (action.type === 'bulk-parcel') {
        action.actions.forEach(item => {
            const parcelBtn = document.getElementById(item.id);
            if (parcelBtn) {
                parcelBtn.dataset.state = item.oldVal;
                currentState[item.id] = item.oldVal;
            }
        });
    } else if (action.type === 'custom-char-single' || action.type === 'custom-char-bulk') {
        document.dispatchEvent(new CustomEvent('restore-custom-char', { detail: { action, isUndo: true } }));
    }



    else if (input) {
        if (action.type === 'checkbox') input.checked = action.oldVal;
        else input.value = action.oldVal;

        currentState[action.id] = action.oldVal;
        input.dispatchEvent(new Event('change'));
    }

    else if (action.type === 'bulk-hint') {
        action.actions.forEach(step => {
            // Find the specific checkbox by its data-id
            const checkbox = document.querySelector(`.hint-checkbox[data-id="${step.id}"]`);

            if (checkbox) {
                // Set the visual checkmark based on the OLD value
                checkbox.checked = (step.oldVal === '1');

                // Keep the dataset and global state in sync
                checkbox.setAttribute('data-state', step.oldVal);
                currentState[step.id] = step.oldVal;
            }
        });
    } else if (action.type === 'single-hint') {
        const checkbox = document.querySelector(`.hint-checkbox[data-id="${action.id}"]`);
        if (checkbox) {
            checkbox.checked = (action.oldVal === '1');
            checkbox.setAttribute('data-state', action.oldVal);
            currentState[action.id] = action.oldVal;
        }
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
    else if (action.type === 'bulk-parcel') {
        action.actions.forEach(item => {
            const parcelBtn = document.getElementById(item.id);
            if (parcelBtn) {
                parcelBtn.dataset.state = item.newVal;

                if (typeof PARCEL_STATES !== 'undefined') {
                    const textElement = parcelBtn.querySelector('.status-text');
                    if (textElement) textElement.textContent = PARCEL_STATES[item.newVal];
                }

                currentState[item.id] = item.newVal;
            }
        });
    }
    else if (input) {
        if (action.type === 'checkbox') input.checked = action.newVal;
        else input.value = action.newVal;

        currentState[action.id] = action.newVal;
        input.dispatchEvent(new Event('change'));
    }
    else if (action.type === 'bulk-hint') {
        action.actions.forEach(step => {
            // Find the specific checkbox by its data-id
            const checkbox = document.querySelector(`.hint-checkbox[data-id="${step.id}"]`);

            if (checkbox) {
                // Set the visual checkmark based on the NEW value
                checkbox.checked = (step.newVal === '1');

                // Keep the dataset and global state in sync
                checkbox.setAttribute('data-state', step.newVal);
                currentState[step.id] = step.newVal;
            }
        });
    } else if (action.type === 'single-hint') {
        const checkbox = document.querySelector(`.hint-checkbox[data-id="${action.id}"]`);
        if (checkbox) {
            checkbox.checked = (action.newVal === '1');
            checkbox.setAttribute('data-state', action.newVal);
            currentState[action.id] = action.newVal;
        }
    } else if (action.type === 'custom-char-single' || action.type === 'custom-char-bulk') {
        document.dispatchEvent(new CustomEvent('restore-custom-char', { detail: { action, isUndo: false } }));
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