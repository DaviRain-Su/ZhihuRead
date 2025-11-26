// Initial cleanup logic
console.log("Zhihu Pure Reader Pro (Customizable) activated.");

// --- Settings Handling ---

function applySettings(settings) {
    // 1. Theme
    if (settings.theme) {
        document.body.setAttribute('data-theme', settings.theme);
    }

    // 2. Font Family
    if (settings.fontFamily) {
        document.body.setAttribute('data-font', settings.fontFamily);
    }

    // 3. Font Size
    if (settings.fontSize) {
        document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px');
    }

    // 4. Page Width
    if (settings.pageWidth) {
        document.documentElement.style.setProperty('--content-width', settings.pageWidth + 'px');
    }
}

// Default Defaults
const defaultSettings = {
    theme: 'warm',
    fontFamily: 'serif',
    fontSize: 20,
    pageWidth: 900
};

// 1. Apply Defaults Immediately
applySettings(defaultSettings);

// 2. Load from Storage
chrome.storage.local.get(['zhihu_settings'], (result) => {
    const settings = { ...defaultSettings, ...result.zhihu_settings };
    applySettings(settings);
});

// 3. Listen for updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSettings') {
        applySettings(request.settings);
        // Respond to popup to prevent "message port closed" error
        sendResponse({ status: "success" });
    }
    // Return true to indicate we might respond asynchronously (good practice, though we responded synchronously above)
    return true; 
});


// --- Mode Logic ---

function checkAndApplyMode() {
    const path = window.location.pathname;
    // Check if we are on a "readable" page
    const isReadablePage = path.startsWith('/question/') || path.startsWith('/p/');

    if (isReadablePage) {
        document.body.classList.add('pure-reader-mode');
        cleanUp(); 
    } else {
        document.body.classList.remove('pure-reader-mode');
    }
}

function cleanUp() {
    if (!document.body.classList.contains('pure-reader-mode')) return;

    const selectorsToRemove = [
        '.Ad',
        '.Pc-card', 
        '.TopstoryItem--advertCard',
        '.MCNLinkCard', 
        '.ZVideo-mobileLink',
        '.Reward', 
        '.FollowButton'
    ];

    selectorsToRemove.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
}

// Run checks on load
checkAndApplyMode();

// Listen for URL changes
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    checkAndApplyMode();
  }
}).observe(document, {subtree: true, childList: true});

// Cleanup observer
const observer = new MutationObserver(cleanUp);
observer.observe(document.body, { childList: true, subtree: true });
