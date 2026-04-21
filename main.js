import { readSaveOffset } from "./readwritesavefile";



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
    readSaveOffset(hexValBox.value, hexSizeBox.value);
});

