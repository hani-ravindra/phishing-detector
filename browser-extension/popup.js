//
// --- popup.js (Final Version with Feedback Loop) ---
//
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all our new UI elements
    const safeView = document.getElementById('safe-view');
    const warningView = document.getElementById('warning-view');
    const neutralView = document.getElementById('neutral-view');
    
    const reportSafeBtn = document.getElementById('report-safe-btn');
    const reportPhishingBtn = document.getElementById('report-phishing-btn');
    
    const feedbackButtons = document.querySelector('.feedback-buttons');
    const feedbackThanks = document.getElementById('feedback-thanks');

    let currentUrl = ''; // Store the tab's URL
    
    // --- Main Function to Update the UI ---
    function updatePopup(data) {
        // Hide all views first
        safeView.style.display = 'none';
        warningView.style.display = 'none';
        neutralView.style.display = 'block'; // Show 'Analyzing' by default

        if (data && data.status) {
            if (data.status === 'phishing') {
                neutralView.style.display = 'none';
                warningView.style.display = 'block';
            } else if (data.status === 'legitimate') {
                neutralView.style.display = 'none';
                safeView.style.display = 'block';
            }
        }
    }

    // --- Function to send feedback to the API ---
    function sendFeedback(status) {
        const endpoint = status === 'safe' ? '/report_safe' : '/report_phishing';
        
        fetch(`http://127.0.0.1:5000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: currentUrl }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Show 'Thank you' message
                feedbackButtons.style.display = 'none';
                feedbackThanks.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error sending feedback:', error);
        });
    }

    // --- Add Click Listeners for Feedback ---
    reportSafeBtn.addEventListener('click', () => {
        sendFeedback('safe');
    });

    reportPhishingBtn.addEventListener('click', () => {
        sendFeedback('phishing');
    });

    // --- Logic to get current tab and status ---
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab || !currentTab.id) return;
        
        currentUrl = currentTab.url; // Save the URL for feedback

        // 1. Check storage immediately on open
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