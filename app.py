from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os # <-- Import the os library

app = Flask(__name__)
CORS(app)

# --- Model Loading ---
try:
    model = joblib.load('phishing_detector_model.joblib')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# --- Main API Routes ---
@app.route('/')
def home():
    return "Phishing Detector API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'status': 'error', 'message': 'Model not loaded'}), 500
    
    try:
        features = request.json
        # The order of features MUST match the training order
        feature_list = [
            features['url_length'], features['hostname_length'], features['dot_count'],
            features['slash_count'], features['has_ip'], features['has_special_chars'],
            features['subdomain_count'], features['has_https'], features['has_sensitive_words'],
            features['directory_count'], features['query_param_count'], features['is_shortened']
        ]
        
        prediction = model.predict([feature_list])
        status = 'phishing' if prediction[0] == 1 else 'legitimate'
        return jsonify({'status': status})
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# --- NEW: Feedback Routes ---

@app.route('/report_phishing', methods=['POST'])
def report_phishing():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'status': 'error', 'message': 'No URL provided'}), 400
    
    # Save the reported URL to a file
    feedback_file = 'reported_urls.csv'
    new_data = pd.DataFrame({'URL': [url], 'Reported_As': ['phishing']})
    
    if not os.path.isfile(feedback_file):
        new_data.to_csv(feedback_file, index=False)
    else:
        new_data.to_csv(feedback_file, mode='a', header=False, index=False)
        
    print(f"REPORT (PHISHING): {url}")
    return jsonify({'status': 'success', 'message': 'Report received'})

@app.route('/report_safe', methods=['POST'])
def report_safe():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({'status': 'error', 'message': 'No URL provided'}), 400
    
    url = data.get('url')
    
    # Save the reported URL to a file
    feedback_file = 'reported_urls.csv'
    new_data = pd.DataFrame({'URL': [url], 'Reported_As': ['legitimate']})
    
    if not os.path.isfile(feedback_file):
        new_data.to_csv(feedback_file, index=False)
    else:
        new_data.to_csv(feedback_file, mode='a', header=False, index=False)
        
    print(f"REPORT (SAFE): {url}")
    return jsonify({'status': 'success', 'message': 'Report received'})

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True)