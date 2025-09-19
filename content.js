// -------------------------
// 1️⃣ Listen for messages from background.js
// -------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "showWarning") {
        injectWarningBanner();
    }
});

// -------------------------
// 2️⃣ Inject a red warning banner at the top
// -------------------------
function injectWarningBanner() {
    // Prevent multiple banners
    if (document.getElementById("phishing-warning-banner")) return;

    const banner = document.createElement("div");
    banner.id = "phishing-warning-banner";
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.backgroundColor = "red";
    banner.style.color = "white";
    banner.style.fontSize = "18px";
    banner.style.fontWeight = "bold";
    banner.style.textAlign = "center";
    banner.style.zIndex = "999999";
    banner.style.padding = "10px";
    banner.textContent = "⚠ WARNING: This site may be a phishing website!";

    // Optional: Add a close button
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✖";
    closeBtn.style.marginLeft = "20px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.float = "right";
    closeBtn.onclick = () => banner.remove();

    banner.appendChild(closeBtn);
    document.body.prepend(banner);
}

