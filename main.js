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