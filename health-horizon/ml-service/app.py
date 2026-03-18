from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "health-horizon-ml"})

@app.route('/predict', methods=['POST'])
def predict():
    # Placeholder for future ML model (e.g. disease prediction)
    data = request.get_json()
    return jsonify({
        "prediction": "Inconclusive (Stub)",
        "confidence": 0.0,
        "message": "ML Model deployment pending (Level 11)"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
