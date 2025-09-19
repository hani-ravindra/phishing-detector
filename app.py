from flask import Flask, request, jsonify
import pickle
import numpy as np

# -------------------------
# 1️⃣ Initialize Flask App
# -------------------------
app = Flask(__name__)

# -------------------------
# 2️⃣ Load Saved Model
# -------------------------
with open("phishing_model.pkl", "rb") as f:
    model = pickle.load(f)

# -------------------------
# 3️⃣ Health Check Routes
# -------------------------
@app.route("/")
def home():
    return "✅ Phishing Detection Flask Server is running!"

@app.route("/ping")
def ping():
    return jsonify({"status": "ok"})

# -------------------------
# 4️⃣ Prediction Endpoint
# -------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get JSON data
        data = request.get_json()

        if not data or "features" not in data:
            return jsonify({
                "status": "error",
                "message": "Request must contain 'features' field with a list of values"
            }), 400

        features = data["features"]

        # Validate feature length (expecting 30 features)
        if not isinstance(features, list) or len(features) != 30:
            return jsonify({
                "status": "error",
                "message": f"Expected 30 features, got {len(features)}"
            }), 400

        # Convert to numpy array & reshape
        features = np.array(features).reshape(1, -1)

        # Predict
        prediction = int(model.predict(features)[0])
        result = "Phishing" if prediction == 1 else "Legitimate"

        return jsonify({
            "status": "success",
            "prediction": prediction,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# -------------------------
# 5️⃣ Run the App
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
