// ------------------------- RNG FUNCTIONS -------------------------
function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^ (h >>> 16)) >>> 0;
    };
}

function mulberry32(a) {
    return function() {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

let RNG;
function setSeed(s, persist = true) {
    const seedStr = String(s || 'default');
    const seedGen = xmur3(seedStr);
    RNG = mulberry32(seedGen());
    if (persist) {
        try {
            localStorage.setItem('sieSeed', seedStr);
        } catch (_) {}
    }
}

(function initSeedEarly() {
    try {
        const params = new URLSearchParams(location.search);
        const explicit = params.get('seed') || localStorage.getItem('sieSeed');
        if (explicit) {
            setSeed(explicit);
        } else {
            const buf = new Uint32Array(1);
            if (typeof crypto !== 'undefined' && crypto && crypto.getRandomValues) {
                crypto.getRandomValues(buf);
            } else {
                buf[0] = Math.floor(Math.random() * 2 ** 32);
            }
            const sessionSeed = `session-${buf[0]}`;
            setSeed(sessionSeed, false);
        }
    } catch (e) {
        setSeed('session-' + Math.floor(Math.random() * 2 ** 32), false);
    }
})();

// Register service worker
navigator.serviceWorker && navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.warn);

// ---- kill the Session Seed UI & logic (drop-in) ----
(() => {
    function removeSeedStuff() {
        for (const lbl of document.querySelectorAll('label')) {
            if (/session seed/i.test(lbl.textContent || '')) {
                const section = lbl.closest('.card, .panel, .section, form, div') || lbl.parentElement;
                if (section) section.remove();
            }
        }
        const sel = [
            '#seed',
            '#seed-input',
            '#session-seed',
            '.seed',
            '.seed-section',
            '#apply-seed',
            '#preflight-check'
        ];
        sel.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
        for (const b of document.querySelectorAll('button')) {
            const t = (b.textContent || '').trim().toLowerCase();
            if (t === 'apply seed' || t === 'preflight check') b.remove();
        }
    }

    window.__SIE_DISABLE_SEED__ = true;
    window.getSeed = () => null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeSeedStuff, { once: true });
    } else {
        removeSeedStuff();
    }
})();

// ------------------------- RNG HELPER FUNCTIONS -------------------------
function rand() {
    return RNG();
}

function seededShuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randInt(min, max) {
    return Math.floor(rand() * (max - min + 1)) + min;
}

// ------------------------- QUESTION BANK -------------------------
const questionBank = [];
function generateParametricBank() {
    // Logic to populate questionBank (placeholder)
}
generateParametricBank();

// ------------------------- APP STATE -------------------------
let currentQuizState = {
    mode: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    timeLimit: 0,
    timer: null,
};

// ------------------------- HELPERS -------------------------
function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function showScreen(screenEl) {
    const screens = [startScreen, quizScreen, resultsScreen, dashboardScreen].filter(Boolean);
    screens.forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    if (screenEl) {
        screenEl.classList.remove('hidden');
        screenEl.classList.add('active');
    }
}

function updateProgress() {
    const total = currentQuizState.questions.length || 1;
    const answered = currentQuizState.answers.filter(a => a !== null && a !== undefined).length;
    const pct = Math.round((currentQuizState.currentIndex + 1) / total * 100);
}

// Package.json addition
{
  "scripts": {
    "deploy": "node deploy.mjs"
  }
}

