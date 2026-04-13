


// Getting the file input from the html
const fileInput = document.getElementById('filePicker');
const uploadBtn = document.getElementById('uploadBtn');
const testBtn = document.getElementById('testBtn')

// Listens for the file to change.
fileInput.addEventListener("change", function() {
    getBufferFromSave(fileInput.files[0]);
});


testBtn.addEventListener("click", function() {
    readSaveOffset(0x9D74, 4);
});



// Starts as null and gets assigned by readFromSave
let activeSaveBuffer = null;

// This function will only read the data from the save file and then declare the buffer. Async because file reading
async function getBufferFromSave(saveFile) {
    // Check if we have a file
    if (!saveFile) {
        console.log("No save file provided")
        return;
    }

    console.log("File name: ", saveFile.name)
    
    // Setting the reading input buffer. Then setting the active buffer outside the function
    const rawSaveBuffer = await saveFile.arrayBuffer();
    activeSaveBuffer = new DataView(rawSaveBuffer);
}

// This is a helper function to read a specific spot in the file's memory. 
// It takes the address in as hex and also the number of bytes to read.
function readSaveOffset(address, sizeBytes, signed=false, decimal=false) {
    let offsetValue = null;
    // Reading one byte. Not little endian
    if (sizeBytes == 1) {
        if (signed) {
            // Since signed, we get an int8
            offsetValue = activeSaveBuffer.getint8(address);
        } else {
            // Not signed so Uint8
            offsetValue = activeSaveBuffer.getUint8(address);
        }

    }
    // Short. Little endian
    if (sizeBytes == 2) {
        offsetValue = activeSaveBuffer.getUint16(address, true);
    }
    // Int. Little endian
    if (sizeBytes == 4 && !decimal) {
        offsetValue = activeSaveBuffer.getUint32(address, true);
    }
    // Float. Little endian
    if (sizeBytes == 4 && decimal) {
        offsetValue = activeSaveBuffer.getFloat32(address, true);
    }
    console.log(offsetValue)
    // If offset value is null, we didn't specify sizeBytes parameter correctly probably
    return offsetValue;
}






// This function needs to read the state of the save variables and then write it to a file. 
// Will probably need a default save to add to. Then call checksum check before returning the new file.
function writeToSave() {
    let x;
}






/*

Quick Reference for Reading Different Sizes:

If you are digging around at specific hex offsets, you are likely reading specific data types.
 Here is what you use depending on what is stored at that address:

    view.getUint8(0x... ) - Reads 1 byte (0 to 255)

    view.getInt8(0x... ) - Reads 1 byte signed (-128 to 127)

    view.getUint16(0x... , true) - Reads 2 bytes (Short)

    view.getUint32(0x... , true) - Reads 4 bytes (Int)

    view.getFloat32(0x... , true) - Reads 4 bytes (Decimal/Float)

Note: If you are reverse engineering a file format or reading a memory dump,
the data is almost certainly "little-endian" (which is why you pass true as the second argument for anything larger than 1 byte).

*/

