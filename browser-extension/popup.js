//
// --- popup.js (Professional UI Version) ---
//

document.addEventListener('DOMContentLoaded', () => {
    // We only need to find the message element
    const statusMessage = document.getElementById('status-message');
    // We can also find the logo if we want to change it
    const statusLogo = document.getElementById('status-logo');

    // Function to update the popup's display
    function updatePopup(data) {
        if (data && data.status) {
            if (data.status === 'phishing') {
                // Set logo to a "warning" version (if you create one)
                // statusLogo.src = 'icons/icon-warning.png'; 
                statusMessage.textContent = 'Warning: Phishing Site!';
                statusMessage.className = 'warning';
            } else if (data.status === 'legitimate') {
                // Set logo to a "safe" version (if you create one)
                // statusLogo.src = 'icons/icon-safe.png';
                statusMessage.textContent = 'This site looks safe.';
                statusMessage.className = 'safe';
            } else if (data.status === 'error') {
                statusMessage.textContent = 'Could not get prediction.';
                statusMessage.className = 'neutral';
            }
        } else {
            // Default message
            statusMessage.textContent = 'Analyzing...';
            statusMessage.className = 'neutral';
        }
    }

    // 1. Check for the status immediately when the popup opens
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab || !currentTab.id) return;

        chrome.storage.local.get(currentTab.id.toString(), (result) => {
            const data = result[currentTab.id.toString()];
            updatePopup(data);
        });
    });

    // 2. Listen for real-time changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (!currentTab || !currentTab.id) return;

            if (changes[currentTab.id.toString()]) {
                const newData = changes[currentTab.id.toString()].newValue;
                updatePopup(newData);
            }
        });
    });
});