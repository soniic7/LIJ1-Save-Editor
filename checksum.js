

// The function to calculate the checksum for the save file. 
// Credits to MR-SEVERN-GAMING for implementing this in Python.
export function updateChecksum(fileBuffer) {
    const dataView = new DataView(fileBuffer);

    // The memory offsets and the salt for LIJ1.
    // Obtained from MR-SEVERN-GAMING's checksum Python script.
    const startOffset = 8232;
    const endOffset = 40872;
    // This is 0x005C0B59 in hex apparently
    const salt = 6031769; 

    let checksum = salt;

    // Looping through the file data 4 bytes at a time
    for (let currentOffset = startOffset; currentOffset < endOffset; currentOffset += 4) {
        // This converts the current data to a 32 bit integer for the checksum counting.
        // true means littleEndian here
        let chunkValue = dataView.getUint32(currentOffset, true)

        // Add to total and wrap around to 0 if over integer limit.
        // This is what the checksum function is doing.
        // Shifting 0 to the right to confine to 32 bits for checksum math.
        checksum = (checksum + chunkValue) >>> 0


    }

    // The old checksum at the offset from before. Little endian
    let oldChecksum = dataView.getUint32(endOffset, true);

    // Converting to strings to log to console
    console.log("Old Checksum: " + oldChecksum.toString(16).toUpperCase());
    console.log("New Checksum: " + checksum.toString(16).toUpperCase());

    // If checksum unchanged, don't change it.
    if (checksum !== oldChecksum) {
        dataView.setUint32(endOffset, checksum, true);
        console.log("File modified: New checksum written successfully.");
    } else {
        console.log("File unchanged: Checksum is already correct.");
    }

    // Return the updated buffer
    return fileBuffer; 

}


