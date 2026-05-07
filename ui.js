import { validPercents } from "./validpercentages.js";

export function initUI() {
    initTabs();
    initPercentageSnap();
    initLevelSelect();
}

// --- Tab Switching Logic ---
function initTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.getAttribute('data-target');
            if (targetId) {
                document.getElementById(targetId).classList.add('active');
            }
        });
    });
}

// --- Percentage Snapping Logic ---
function initPercentageSnap() {
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('snap-input')) {
            let userInput = parseFloat(e.target.value);

            if (isNaN(userInput)) {
                e.target.value = 0;
                return;
            }

            // Find the closest percentage from validPercents
            const closestPercent = validPercents.reduce((prev, curr) => {
                return (Math.abs(curr - userInput) < Math.abs(prev - userInput) ? curr : prev);
            });

            e.target.value = closestPercent;

            // Ensure completionMap is defined globally or imported if you use it here
            if (typeof completionMap !== 'undefined') {
                const hexValue = completionMap[closestPercent];
                console.log(`Matched %: ${closestPercent} | Hex to Write: ${hexValue}`);
                e.target.setAttribute('data-hex', hexValue);
            }
        }
    });
}

// --- Level Selection Logic ---
function initLevelSelect() {
    const levelSelect = document.getElementById('levelSelectInput');
    const mainDiv = document.getElementById('mainLevels');
    const bonusDiv = document.getElementById('bonusLevels');
    
    if (!levelSelect || !mainDiv || !bonusDiv) return;

    const mainCards = mainDiv.querySelectorAll('.save-item-card');
    const bonusCards = bonusDiv.querySelectorAll('.save-item-card');
    const fastestTimeBox = document.getElementById('fastestTimeBox');

    bonusCards.forEach(card => card.style.opacity = '0');

    if (levelSelect.value === 'YoungIndy' && fastestTimeBox) {
        fastestTimeBox.style.display = 'none';
    }

    levelSelect.addEventListener('change', function () {
        const bonusValues = ['YoungIndy', 'AncientCity', 'Warehouse'];
        const isYoungIndy = this.value === 'YoungIndy';

        if (isYoungIndy && fastestTimeBox) {
            fastestTimeBox.style.opacity = '0';
        }

        if (bonusValues.includes(this.value)) {
            mainCards.forEach(card => card.style.opacity = '0');

            setTimeout(() => {
                mainDiv.style.display = 'none';
                bonusDiv.style.display = 'contents';

                if (fastestTimeBox) {
                    fastestTimeBox.style.display = isYoungIndy ? 'none' : 'flex';
                }

                setTimeout(() => {
                    bonusCards.forEach(card => {
                        if (isYoungIndy && card === fastestTimeBox) return;
                        card.style.opacity = '1';
                    });
                }, 10);
            }, 400);

        } else {
            bonusCards.forEach(card => card.style.opacity = '0');

            setTimeout(() => {
                bonusDiv.style.display = 'none';
                mainDiv.style.display = 'contents';

                if (fastestTimeBox) fastestTimeBox.style.display = 'flex';

                setTimeout(() => {
                    mainCards.forEach(card => card.style.opacity = '1');
                }, 10);
            }, 400);
        }
    });
}