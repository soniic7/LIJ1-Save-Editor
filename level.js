import { levelConstraints } from "./constraints.js";









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
            this.constraints = lookupConstraints(this.levelId);
    }



    // This function gets the constraints from the constraint table for levels
    lookupLevelConstraints(levelId) {
        return levelConstraints[levelId];
    }



}



class BonusLevel {


    constructor(levelId, unlocked, completed, bestTime /* excludes young indy */) {
        this.levelId = levelId;
        this.unlocked = unlocked;
        this.completed = completed;
        this.bestTime = bestTime; // 4 bytes ;little endian
        this.constraints = lookupConstraints(this.levelId);
    }


    // This function gets the constraints from the constraint table for levels
    lookupLevelConstraints(levelId) {
        return levelConstraints[levelId];
    }
    
}

