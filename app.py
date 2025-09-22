# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# Initialize the Flask application
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Load the trained model
try:
    model = joblib.load('phishing_detector_model.joblib')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/')
def home():
    return "Phishing Detector API is running!"

# --- NEW DIAGNOSTIC ENDPOINT ---
@app.route('/model_info')
def model_info():
    """Returns the number of features the loaded model expects."""
    if model is not None:
        # For scikit-learn compatible models, n_features_in_ stores the feature count
        num_features = model.n_features_in_
        return jsonify({'model_status': 'loaded', 'features_expected': num_features})
    else:
        return jsonify({'model_status': 'error', 'message': 'Model could not be loaded.'})
# --- END NEW ENDPOINT ---


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not available'}), 500

    try:
        data = request.get_json(force=True)
        
        feature_list = [
            data['url_length'], data['hostname_length'], data['dot_count'],
            data['slash_count'], data['has_ip'], data['has_special_chars'],
            data['subdomain_count'], data['has_https'], data['has_sensitive_words'],
            data['directory_count'], data['query_param_count'], data['is_shortened']
        ]

        features = np.array(feature_list).reshape(1, -1)
        prediction = model.predict(features)
        result = 'phishing' if prediction[0] == 1 else 'legitimate'
        return jsonify({'status': result})

    except Exception as e:
        # A more descriptive error for feature mismatch
        if 'mismatch' in str(e):
             error_msg = f"Feature shape mismatch, expected: {model.n_features_in_}, got {len(feature_list)}"
             return jsonify({'error': f"An error occurred during prediction: {error_msg}"}), 400
        return jsonify({'error': f'An error occurred: {e}'}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)