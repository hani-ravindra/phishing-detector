//
// --- popup.js ---
//

// This script runs when the user clicks the extension icon.

document.addEventListener('DOMContentLoaded', () => {
    const statusIcon = document.getElementById('status-icon');
    const statusMessage = document.getElementById('status-message');

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab) return;

        // Retrieve the saved status for this tab from chrome.storage
        chrome.storage.local.get(currentTab.id.toString(), (result) => {
            const data = result[currentTab.id.toString()];

            if (data) {
                // Update the UI based on the stored status
                if (data.status === 'phishing') {
                    statusIcon.textContent = '⚠️';
                    statusMessage.textContent = 'Warning: Phishing Site!';
                    statusMessage.className = 'warning';
                } else if (data.status === 'legitimate') {
                    statusIcon.textContent = '✅';
                    statusMessage.textContent = 'This site looks safe.';
                    statusMessage.className = 'safe';
                } else if (data.status === 'error') {
                    statusIcon.textContent = '❓';
                    statusMessage.textContent = 'Could not get a prediction.';
                    statusMessage.className = 'neutral';
                }
            } else {
                // Default message if no data is found
                statusIcon.textContent = '🤔';
                statusMessage.textContent = 'No analysis data for this page.';
                statusMessage.className = 'neutral';
            }
        });
    });
});