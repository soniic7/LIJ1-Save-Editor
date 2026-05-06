

// Key levelId, value constraints list
const levelConstraints = {
    // Raiders
    "1-1" : [],
    "1-2" : ["1-1_complete"],
    "1-3" : ["1-2_complete"],
    "1-4" : ["1-3_complete"],
    "1-5" : ["1-4_complete"],
    "1-6" : ["1-5_complete"],
    // Temple
    "2-1" : ["1-1_complete"],
    "2-2" : ["2-1_complete"],
    "2-3" : ["2-2_complete"],
    "2-4" : ["2-3_complete"],
    "2-5" : ["2-4_complete"],
    "2-6" : ["2-5_complete"],
    // Crusade
    "3-1" : ["1-1_complete"],
    "3-2" : ["3-1_complete"],
    "3-3" : ["3-2_complete"],
    "3-4" : ["3-3_complete"],
    "3-5" : ["3-4_complete"],
    "3-6" : ["3-5_complete"],
    // Bonus levels
    "YoungIndy" : ["?"],
    "AncientCity" : ["??"],
    "Warehouse" : ["???"]
}

// This function will recursively enforce constraints.
function enforceConstraints(key, newValue) {
    ;
}




