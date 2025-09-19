// background.js

// -------------------------
// 1️⃣ Import feature extraction from utils.js
// -------------------------
importScripts("utils.js"); // extractFeatures(url) is now available

// -------------------------
// 2️⃣ Send features to Flask API
// -------------------------
function sendFeaturesToAPI(featObj, tabId) {
    // Build an array in EXACT order used during model training
    const featureArray = [
        featObj.having_IP_Address,
        featObj.URL_Length,
        featObj.Shortining_Service,
        featObj.having_At_Symbol,
        featObj.double_slash_redirecting,
        featObj.Prefix_Suffix,
        featObj.having_Sub_Domain,
        featObj.SSLfinal_State,
        featObj.Domain_registeration_length,
        featObj.Favicon,
        featObj.port,
        featObj.HTTPS_token,
        featObj.Request_URL,
        featObj.URL_of_Anchor,
        featObj.Links_in_tags,
        featObj.SFH,
        featObj.Submitting_to_email,
        featObj.Abnormal_URL,
        featObj.Redirect,
        featObj.on_mouseover,
        featObj.RightClick,
        featObj.popUpWidnow,
        featObj.Iframe,
        featObj.age_of_domain,
        featObj.DNSRecord,
        featObj.web_traffic,
        featObj.Page_Rank,
        featObj.Google_Index,
        featObj.Links_pointing_to_page,
        featObj.Statistical_report
    ];

    console.log("DEBUG: featureArray (len=" + featureArray.length + "):", featureArray);

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ features: featureArray })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Prediction result:", data);

        // ⚠️ Show notification if phishing
        if (data.prediction === 1) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: '⚠️ Phishing Alert',
                message: 'This site may be unsafe!',
                priority: 2
            });

            // Optionally send message to content script to show banner
            chrome.tabs.sendMessage(tabId, { action: "showWarning" });
        }
    })
    .catch(err => {
        console.error("Error calling Flask API:", err);
    });
}

// -------------------------
// 3️⃣ Listen to tab updates
// -------------------------
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const featObj = extractFeatures(tab.url); // comes from utils.js
        sendFeaturesToAPI(featObj, tabId);
    }
});
