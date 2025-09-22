# 🎣 Phishing Detector

A browser extension that uses a machine learning model to detect and warn users about potential phishing websites in real-time.

---

## 📝 Description

Phishing Detector is a full-stack machine learning application with two main components:

- **Python Flask backend:** Serves a pre-trained XGBoost model via a REST API.
- **JavaScript browser extension:** Extracts features from the current URL, sends them to the API for prediction, and alerts users of potential threats.

---

## ✨ Key Features

- **Real-Time Detection:** Analyzes URLs as you browse.
- **ML-Powered:** Uses an XGBoost model trained on over 500,000 URLs.
- **Browser Notifications:** Immediate system-level alerts for suspected phishing sites.
- **Simple UI:** Clean popup interface to check the status of the current page.

---

## ⚙️ System Architecture

1. **Browser Extension (`background.js`):** Intercepts the URL of newly loaded pages.
2. **Feature Extraction:** Extension extracts 12 key features from the URL.
3. **API Request:** Sends a POST request with features (JSON) to the Flask server.
4. **Flask API (`app.py`):** Receives features, loads the XGBoost model, and predicts.
5. **API Response:** Returns a JSON response (e.g., `{"status": "phishing"}`).
6. **User Notification:** Extension triggers a warning notification if necessary.

---

## 🛠️ Technologies Used

- **Backend:** Python, Flask, Scikit-learn, XGBoost, Pandas
- **Frontend:** JavaScript, HTML, CSS (Web Extension)
- **Environment:** Jupyter Notebook, Visual Studio Code

---

## 🚀 Setup and Installation

### Prerequisites

- Python 3.8+
- Google Chrome

### 1. Backend Setup

```bash
# Clone this repository (if you haven't already)
git clone <your-repo-url>
cd phishing-detector

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install the required Python libraries
pip install -r requirements.txt

# Run the Flask server (API at http://127.0.0.1:5000)
python app.py
```

### 2. Frontend Setup

1. Open Google Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top-right corner).
3. Click **Load unpacked**.
4. Select the `browser-extension` folder from this project directory.
5. The "Phishing Detector" extension should now be active.

---

## 🚦 Usage

- Ensure the backend server is running and the extension is loaded.
- Navigate to any website; the extension will analyze the URL in the background.
- If a site is suspicious, you'll receive a system notification.
- Click the extension's icon in the toolbar at any time to see the status of the current page.

---
