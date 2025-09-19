// popup.js

// -------------------------
// 1️⃣ Elements
// -------------------------
const statusEl = document.getElementById("status");
const proceedBtn = document.getElementById("proceedBtn");

// -------------------------
// 2️⃣ Check the current tab URL
// -------------------------
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url) {
        // Use the shared extractFeatures from utils.js
        const features = extractFeatures(currentTab.url);

        console.log("Popup sending features:", Object.values(features));

        fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ features: Object.values(features) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.prediction === 1) {
                statusEl.textContent = "⚠ Phishing Warning!";
                statusEl.classList.add("warning");
            } else {
                statusEl.textContent = "✅ Safe";
                statusEl.classList.add("safe");
            }
        })
        .catch(err => {
            statusEl.textContent = "Error checking URL";
            console.error(err);
        });
    }
});

// -------------------------
// 3️⃣ Optional: Proceed anyway button
// -------------------------
proceedBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url }); // reload current tab
    });
});
