import { getBufferFromSave, readSaveOffset } from "./readwritesavefile.js";



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

