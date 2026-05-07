import { initFileSystem } from "./fileSystem.js";
import { initUI } from "./ui.js";
import { initHistory } from "./history.js";
import { initCharacterGrid } from "./characterGrid.js";

// Wait for the DOM to load exactly once, then run all modules
document.addEventListener('DOMContentLoaded', () => {
    initFileSystem();
    initUI();
    initHistory();
    initCharacterGrid();
});