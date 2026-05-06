import { getBufferFromSave, readSaveOffset } from "./readwritesavefile.js";
import { validPercents } from "./validpercentages.js";



// Getting the file input from the html
const fileInput = document.getElementById('filePicker');
const uploadBtn = document.getElementById('uploadBtn');
const testBtn = document.getElementById('testBtn');
const hexValBox = document.getElementById('hexOffsetBox');
const hexSizeBox = document.getElementById('hexSizeBox');

// Listens for the file to change.
fileInput.addEventListener("change", function() {
    getBufferFromSave(fileInput.files[0]);
});


testBtn.addEventListener("click", function() {
    //readSaveOffset(0x9D74, 4);
    console.log("Testing script")
    readSaveOffset(parseInt(hexValBox.value,16), hexSizeBox.value);
});


// --- Tab Switching Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 1. Remove the "active" class from ALL tabs and ALL content
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // 2. Add the "active" class to the tab you just clicked
            tab.classList.add('active');
            
            // 3. Find the matching content ID and make it active
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
});


// 1. Define your list of valid decimals (0 to 100)
const validPercentages = [0, 10.5, 25.2, 50, 75.8, 100]; 

// 2. Add the listener to handle the "snapping"
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('snap-input')) {
        const userInput = parseFloat(e.target.value);
        
        if (isNaN(userInput)) return;

        // Find the number in validDecimals closest to userInput
        const closest = validDecimals.reduce((prev, curr) => {
            return (Math.abs(curr - userInput) < Math.abs(prev - userInput) ? curr : prev);
        });

        // Update the box with the valid choice
        e.target.value = closest;
    }
});

// TODO add tab navigation with arrows


document.addEventListener('change', function(e) {
    if (e.target.classList.contains('snap-input')) {
        let userInput = parseFloat(e.target.value);
        
        if (isNaN(userInput)) {
            e.target.value = 0;
            return;
        }

        // Find the closest percentage from our specific map
        const closestPercent = validPercents.reduce((prev, curr) => {
            return (Math.abs(curr - userInput) < Math.abs(prev - userInput) ? curr : prev);
        });

        // Update the visible box
        e.target.value = closestPercent;

        // Retrieve the Hex Value for later!
        const hexValue = completionMap[closestPercent];
        
        console.log(`Matched %: ${closestPercent} | Hex to Write: ${hexValue}`);
        
        // Store this hex value in the element so your "Save" function can find it
        e.target.setAttribute('data-hex', hexValue);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const levelSelect = document.getElementById('levelSelectInput');
    const mainDiv = document.getElementById('mainLevels');
    const bonusDiv = document.getElementById('bonusLevels');
    
    const mainCards = mainDiv.querySelectorAll('.save-item-card');
    const bonusCards = bonusDiv.querySelectorAll('.save-item-card');
    const fastestTimeBox = document.getElementById('fastestTimeBox');

    // Set initial state
    bonusCards.forEach(card => card.style.opacity = '0');
    
    // If the editor loads and Young Indy is already selected, hide it immediately
    if (levelSelect.value === 'YoungIndy') {
            fastestTimeBox.style.display = 'none';
    }

    levelSelect.addEventListener('change', function() {
        const bonusValues = ['YoungIndy', 'AncientCity', 'Warehouse'];
        const isYoungIndy = this.value === 'YoungIndy';

        // 1. If switching TO Young Indy, fade out that specific box immediately
        if (isYoungIndy) {
            fastestTimeBox.style.opacity = '0';
        }

        if (bonusValues.includes(this.value)) {
            // FADE OUT MAIN
            mainCards.forEach(card => card.style.opacity = '0');
            
            setTimeout(() => {
                mainDiv.style.display = 'none';
                bonusDiv.style.display = 'contents';
                
                // 2. Safely swap the display of the hidden box behind the scenes
                if (isYoungIndy) {
                    fastestTimeBox.style.display = 'none';
                } else {
                    fastestTimeBox.style.display = 'flex'; // Put it back in layout
                }
                
                // FADE IN BONUS
                setTimeout(() => {
                    bonusCards.forEach(card => {
                        // 3. Skip fading in this specific box if we are on Young Indy
                        if (isYoungIndy && card === fastestTimeBox) return;
                        card.style.opacity = '1';
                    });
                }, 10);
            }, 400); 

        } else {
            // FADE OUT BONUS
            bonusCards.forEach(card => card.style.opacity = '0');
            
            setTimeout(() => {
                bonusDiv.style.display = 'none';
                mainDiv.style.display = 'contents';
                
                // Reset the hidden box in the background so it's ready for next time
                fastestTimeBox.style.display = 'flex';
                
                // FADE IN MAIN
                setTimeout(() => {
                    mainCards.forEach(card => card.style.opacity = '1');
                }, 10);
            }, 400); 
        }
    });
});