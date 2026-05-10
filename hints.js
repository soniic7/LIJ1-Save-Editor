import { historyConfig, currentState, undoStack, redoStack, updateButtons } from './history.js';

export const hints = [
    "You need a shovel to paddle boats and rafts.",
    "Some puzzles can only be completed by pressing [TAG] to take control of another character.",
    "Approach piles of LEGO bricks and hold [SPECIAL] to build.",
    "Hit a ramp or press [SPECIAL] when riding motorbikes to pull a wheelie and go faster.",
    "In Free Play, press [TOGGLELEFT] or [TOGGLERIGHT] to choose a different character.",
    "Press [SPECIAL] to use your whip to swing across wide gaps.",
    "Press [SPECIAL] to use your whip to grab things above you.",
    "Press [SPECIAL] to use your whip to pull things that are out of reach.",
    "Press [TAG] to take control of other characters.",
    "Press [TAG] to regain control of other characters.",
    "Look out for LEGO objects hidden in the ground. If you have a shovel, press [SPECIAL] to dig them up.",
    "If you have a spanner, you can press [SPECIAL] to fix machinery.",
    "You need a key to operate this mechanism. Find one and press [SPECIAL] to put it in.",
    "Hold [SPECIAL] to turn the key and operate this mechanism.",
    "Press [SPECIAL] to pull levers.",
    "Press [SPECIAL] to pick up highlighted LEGO objects.",
    "Carry LEGO objects to highlighted plates and press [SPECIAL] to put them in place.",
    "Ladies are more nimble and can jump higher than other characters.",
    "Willie's voice can shatter glass. Hold [SPECIAL] to scream in fear.",
    "Small characters can fit through hatches. Press [SPECIAL] to crawl through.",
    "Monkeys will give you objects in return for a banana. Press [SPECIAL] to throw a banana at them.",
    "You need a book to translate mysterious hieroglyphs.",
    "Use your book to translate the symbols. Press [SPECIAL] to begin.",
    "Follow the sequence to discover the secret.",
    "You can push LEGO objects on tiled floors. Move up to the object and push against it.",
    "Objects with handles can be pushed and pulled. Move up to the handle and push against it.",
    "Shiny silver LEGO objects can be destroyed by blowing them up. Find a way to cause an explosion.",
    "Some vehicles can smash through shiny silver LEGO objects.",
    "Some characters have phobias and will panic, so find a way to clear a path. Remember, small creatures will avoid fire.",
    "Press [TAG] to jump into a nearby vehicle.",
    "Press [JUMP] to jump off, or press [TAG] to switch to another character.",
    "Press [TAG] to jump on a nearby animal.",
    "Press [TAG] to jump into a nearby crane.",
    "While operating a crane, press [ACTION] or [SPECIAL] to pick things up and drop them.",
    "Some mechanisms can be reversed. Hold [ACTION] to wind backwards.",
    "You can use the whip to grab carry objects. Press [SPECIAL] when the object is highlighted.",
    "Press [SPECIAL] to throw an object you're carrying.",
    "You can operate spinners by pushing against the green and red paddles.",
    "When riding an elephant, press [SPECIAL] to pick up highlighted LEGO objects.",
    "Elephants like to play in the mud.",
    "Some animals throw you high into the air when you jump off them.",
    "Only Thuggee characters know the secret way to activate these statues. Remember, some enemies will drop their hats when defeated.",
    "You can fool guards by wearing the right hat. Walk up to a guard post and press [SPECIAL]. Remember, some enemies will drop their hats when defeated.",
    "Both players must be on a vehicle before it can be driven.",
    "Some enemies have items you need. Throw them something else to distract them.",
    "Orange LEGO plates can be activated with extra weight.",
    "Collect and assemble artefact pieces to gain access to new levels.",
    "Indy has been poisoned. You need the blue antidote to cure him.",
    "You can damage enemies by pressing [SPECIAL] to throw LEGO objects at them.",
    "Only small characters can fit through hatches.",
    "Push left or right to lean the cart. You need to do this to hit some targets.",
    "Hit the signals to line up the tracks and escape the mines.",
    "When driving trucks press [JUMP] to accelerate.",
    "All episodes are now unlocked."
];



export function updateAllHintStates(newState) {
    // Stop if history is currently playing back
    if (historyConfig.isUndoRedoing) return;

    const allCheckboxes = document.querySelectorAll('.hint-checkbox');
    const bulkActions = [];
    const isChecked = (newState === 1);
    const targetState = String(newState);

    allCheckboxes.forEach(checkbox => {
        // Read the actual data-state we set earlier, rather than just the checkbox property
        const oldState = checkbox.getAttribute('data-state') || '0';

        if (oldState !== targetState) {
            const hintId = checkbox.dataset.id;

            // 1. Record for history
            bulkActions.push({
                id: hintId,
                oldVal: oldState,
                newVal: targetState
            });

            // 2. Update the visual checkbox
            checkbox.checked = isChecked;
            
            // 3. Update the HTML dataset
            checkbox.setAttribute('data-state', targetState);
            
            // 4. Update the global history state
            if (hintId && typeof currentState !== 'undefined') {
                currentState[hintId] = targetState;
            }
        }
    });

    // Save to history stack
    if (bulkActions.length > 0) {
        undoStack.push({
            type: 'bulk-hint',
            actions: bulkActions
        });

        redoStack.length = 0; 
        if (typeof updateButtons === 'function') updateButtons();
        
        console.log(`Mass updated ${bulkActions.length} hints to state ${newState}.`);
    } else {
        console.log(`All hints were already at state ${newState}.`);
    }
}