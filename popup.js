const defaultSettings = {
    theme: 'warm',
    fontFamily: 'serif',
    fontSize: 20,
    pageWidth: 900
};

let currentSettings = { ...defaultSettings };

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load saved settings
    chrome.storage.local.get(['zhihu_settings'], (result) => {
        if (result.zhihu_settings) {
            currentSettings = { ...defaultSettings, ...result.zhihu_settings };
        }
        updateUI(currentSettings);
    });

    // 2. Bind UI Events
    
    // Theme Buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSettings.theme = btn.dataset.val;
            saveAndBroadcast();
            updateUI(currentSettings);
        });
    });

    // Font Buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSettings.fontFamily = btn.dataset.val;
            saveAndBroadcast();
            updateUI(currentSettings);
        });
    });

    // Sliders (Range Inputs)
    const fontSizeInput = document.getElementById('fontSize');
    const pageWidthInput = document.getElementById('pageWidth');

    fontSizeInput.addEventListener('input', (e) => {
        currentSettings.fontSize = e.target.value;
        saveAndBroadcast(); // Real-time update
    });

    pageWidthInput.addEventListener('input', (e) => {
        currentSettings.pageWidth = e.target.value;
        saveAndBroadcast(); // Real-time update
    });
});

function updateUI(settings) {
    // Update Theme Buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.val === settings.theme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Font Buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
        if (btn.dataset.val === settings.fontFamily) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Sliders
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('pageWidth').value = settings.pageWidth;
}

function saveAndBroadcast() {

    // 1. Save

    chrome.storage.local.set({ 'zhihu_settings': currentSettings });

    console.log('Settings saved:', currentSettings);



    // 2. Broadcast to Active Tab

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        if (tabs[0] && tabs[0].id) {

            console.log('Sending message to tab:', tabs[0].id);

            chrome.tabs.sendMessage(tabs[0].id, { 

                action: 'updateSettings', 

                settings: currentSettings 

            }, (response) => {

                if (chrome.runtime.lastError) {

                    console.error("Message failed:", chrome.runtime.lastError.message);

                } else {

                    console.log("Message sent successfully");

                }

            });

        }

    });

}
