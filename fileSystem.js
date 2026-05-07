import { getBufferFromSave, readSaveOffset } from "./readwritesavefile.js";

export function initFileSystem() {
    const fileInput = document.getElementById('filePicker');
    const testBtn = document.getElementById('testBtn');
    const hexValBox = document.getElementById('hexOffsetBox');
    const hexSizeBox = document.getElementById('hexSizeBox');

    if (fileInput) {
        fileInput.addEventListener("change", function () {
            getBufferFromSave(fileInput.files[0]);
        });
    }

    if (testBtn) {
        testBtn.addEventListener("click", function () {
            console.log("Testing script");
            readSaveOffset(parseInt(hexValBox.value, 16), hexSizeBox.value);
        });
    }
}