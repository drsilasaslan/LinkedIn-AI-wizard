// Define supported languages
const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Español (Spanish)',
    'zh': '中文 (Chinese)',
    'hi': 'हिन्दी (Hindi)',
    'ar': 'العربية (Arabic)',
    'pt': 'Português (Portuguese)',
    'bn': 'বাংলা (Bengali)',
    'ru': 'Русский (Russian)',
    'ja': '日本語 (Japanese)',
    'de': 'Deutsch (German)',
    'fr': 'Français (French)',
    'tr': 'Türkçe (Turkish)',
    'ko': '한국어 (Korean)',
    'it': 'Italiano (Italian)',
    'pl': 'Polski (Polish)',
    'uk': 'Українська (Ukrainian)',
    'nl': 'Nederlands (Dutch)',
    'vi': 'Tiếng Việt (Vietnamese)',
    'th': 'ไทย (Thai)',
    'fa': 'فارسی (Persian)',
    'id': 'Bahasa Indonesia',
    'cs': 'Čeština (Czech)',
    'sv': 'Svenska (Swedish)',
    'ro': 'Română (Romanian)',
    'hu': 'Magyar (Hungarian)'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize API key field
    const apiKeyInput = document.getElementById('api-key');
    const saveButton = document.getElementById('save-button');
    const languageSelect = document.getElementById('language-select');
    const blockVideosToggle = document.getElementById('block-videos');
    const enableTrafficLightToggle = document.getElementById('enable-traffic-light');

    // Populate language dropdown
    for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        languageSelect.appendChild(option);
    }

    // Load saved settings
    chrome.storage.sync.get(['groqApiKey', 'selectedLanguage', 'blockVideos', 'enableTrafficLight'], function(data) {
        if (data.groqApiKey) {
            apiKeyInput.value = data.groqApiKey;
        }
        if (data.selectedLanguage) {
            languageSelect.value = data.selectedLanguage;
        } else {
            // Default to English if no language is selected
            languageSelect.value = 'en';
            chrome.storage.sync.set({ selectedLanguage: 'en' });
        }
        
        // Set block videos toggle state
        if (data.blockVideos !== undefined) {
            blockVideosToggle.checked = data.blockVideos;
        } else {
            // Default to not blocking videos
            chrome.storage.sync.set({ blockVideos: false });
        }
        
        // Set traffic light toggle state
        if (data.enableTrafficLight !== undefined) {
            enableTrafficLightToggle.checked = data.enableTrafficLight;
        } else {
            // Default to enabling traffic light
            chrome.storage.sync.set({ enableTrafficLight: true });
        }
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const selectedLanguage = languageSelect.value;
        const blockVideos = blockVideosToggle.checked;
        const enableTrafficLight = enableTrafficLightToggle.checked;

        if (apiKey) {
            chrome.storage.sync.set({
                groqApiKey: apiKey,
                selectedLanguage: selectedLanguage,
                blockVideos: blockVideos,
                enableTrafficLight: enableTrafficLight
            }, function() {
                // Show success message
                const status = document.getElementById('status');
                status.textContent = 'Settings saved successfully!';
                status.style.color = '#4CAF50';
                setTimeout(function() {
                    status.textContent = '';
                }, 3000);
            });
        } else {
            // Show error message
            const status = document.getElementById('status');
            status.textContent = 'Please enter a valid API key';
            status.style.color = '#f44336';
        }
    });
});
