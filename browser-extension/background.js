// A list of trusted domains that we will not check.
const WHITELIST = [
    'google.com',
    'wikipedia.org',
    'youtube.com',
    'facebook.com',
    'amazon.com',
    'github.com',
    'linkedin.com'
];

// Listen for any updates to a tab.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // We only want to act when the page has fully loaded and has a valid URL.
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {

        const urlObj = new URL(tab.url);
        const hostname = urlObj.hostname.replace('www.', ''); // Normalize by removing 'www.'

        // --- WHITELIST CHECK ---
        // If the site's hostname is in our whitelist, mark as legitimate and stop.
        if (WHITELIST.some(domain => hostname.includes(domain))) {
            console.log(hostname, 'is on the whitelist. Skipping check.');
            chrome.storage.local.set({ [tabId]: { status: 'legitimate', url: tab.url } });
            return; // Exit the function early
        }

        // If not on the whitelist, proceed with feature extraction and API call.
        const url = tab.url;
        const features = extractFeatures(url);

        // Send the extracted features to your Flask API.
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(features),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Prediction for', url, ':', data.status);

            // 1. If phishing is detected, create a browser notification.
            if (data.status === 'phishing') {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'Phishing Alert!',
                    message: `Warning: This website is suspected to be a phishing site.`,
                    priority: 2
                });
            }

            // 2. Save the result to chrome.storage for the popup to use.
            chrome.storage.local.set({ [tabId]: { status: data.status, url: url } });
        })
        .catch(error => {
            console.error('Error calling prediction API:', error);
            // Also save error status
            chrome.storage.local.set({ [tabId]: { status: 'error', url: url } });
        });
    }
});

// Clean up storage when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.remove(tabId.toString());
});


// --- Feature Extraction Function ---
function extractFeatures(url) {
    const urlObj = new URL(url);
    return {
        url_length: url.length,
        hostname_length: urlObj.hostname.length,
        dot_count: (url.match(/\./g) || []).length,
        slash_count: (url.match(/\//g) || []).length,
        has_ip: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(urlObj.hostname) ? 1 : 0,
        has_special_chars: /[@_-]/.test(url) ? 1 : 0,
        subdomain_count: urlObj.hostname.split('.').length - 2,
        has_https: urlObj.protocol === 'https:' ? 1 : 0,
        has_sensitive_words: ['login', 'secure', 'account', 'verify', 'password', 'signin', 'banking'].some(keyword => url.toLowerCase().includes(keyword)) ? 1 : 0,
        directory_count: (urlObj.pathname.match(/\//g) || []).length - 1,
        query_param_count: (urlObj.search.match(/&/g) || []).length + (urlObj.search.includes('?') ? 1 : 0),
        is_shortened: ['bit.ly', 't.co', 'goo.gl', 'tinyurl', 'ow.ly'].some(shortener => urlObj.hostname.includes(shortener)) ? 1 : 0
    };
}