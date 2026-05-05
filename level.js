





const constraintsTable = {
    "1-1": [],
    "1-2": ["1-1"],
    "1-3": ["1-2"],
    "1-4": ["1-3"],
    "1-5": ["1-4"],
    "1-6": ["1-5"]

}




class Level {

    // These will be stored in the format that they appear in the save file.
    constructor(levelId, // "1-1", etc.
        trueAdventurer, 
        trueAdventurerLegacy, 
        storyUnlocked, 
        freeplayUnlocked, 
        artifactBuiltOrder, 
        artifactPiecesCount, 
        artifactBuilt, 
        parcelPosted) {
            this.levelId = levelId;
            this.trueAdventurer = trueAdventurer;
            this.trueAdventurerLegacy = trueAdventurerLegacy;
            this.storyUnlocked = storyUnlocked;
            this.freeplayUnlocked = freeplayUnlocked;
            this.artifactBuiltOrder = artifactBuiltOrder;
            this.artifactPiecesCount = artifactPiecesCount;
            this.artifactBuilt = artifactBuilt;
            this.parcelPosted = parcelPosted;
            this.constraints; // needed ?
    }




    lookupConstraints() {
        return constraintsTable[this.levelId]
    }



}



class BonusLevel {


    //constructor()

    //)
}

