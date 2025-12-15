# from flask import Flask, request, jsonify, render_template
# import joblib
# import numpy as np

# app = Flask(__name__)

# # Load trained model and scaler
# model = joblib.load("xgboost_fraud_model.pkl")
# scaler = joblib.load("scaler.pkl")

# @app.route("/")
# def home():
#     return render_template("index.html")

# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         # Collect 7 input values from form
#         features = [
#             float(request.form.get("V1")),
#             float(request.form.get("V2")),
#             float(request.form.get("V3")),
#             float(request.form.get("V4")),
#             float(request.form.get("V5")),
#             float(request.form.get("V6")),
#             float(request.form.get("Amount"))
#         ]
        
#         # Create array with all 30 features expected by scaler
#         # Fill with zeros except for our 7 features
#         full_features = np.zeros(30)
        
#         # IMPORTANT: Update these indices based on your actual model!
#         # Example: assuming V1-V6 are first 6 features, Amount is last
#         feature_positions = [0, 1, 2, 3, 4, 5, 29]  
        
#         for i, pos in enumerate(feature_positions):
#             full_features[pos] = features[i]
        
#         # Scale and predict
#         features_scaled = scaler.transform([full_features])
#         prediction = model.predict(features_scaled)[0]
        
#         result = "Fraud" if prediction == 1 else "Normal"
#         return render_template("index.html", 
#                              prediction=result,
#                              is_fraud=prediction == 1)

#     except Exception as e:
#         return render_template("index.html", error=str(e))

# if __name__ == "__main__":
#     app.run(debug=True)
from flask import Flask, request, render_template, jsonify
import joblib
import numpy as np
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

# Load model and scaler
try:
    model = joblib.load("xgboost_fraud_model.pkl")
    scaler = joblib.load("scaler.pkl")
    print("Model loaded successfully!")
except:
    print("Warning: Could not load model files")
    model = None
    scaler = None

# Define which 7 features you want to use
# Change these to match the 7 features your model actually needs
YOUR_7_FEATURES = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7']

# All 30 features your model expects (in the exact order)
ALL_FEATURES = [
    'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
    'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
    'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
]

@app.route('/')
def home():
    return render_template('index.html', features=YOUR_7_FEATURES)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None or scaler is None:
            return jsonify({'error': 'Model not loaded', 'success': False})
        
        # Get form data
        data = request.form.to_dict()
        
        # Create array with 30 zeros
        full_features = [0.0] * 30
        
        # Fill in the 7 features you provide
        for i, feature_name in enumerate(ALL_FEATURES):
            if feature_name in YOUR_7_FEATURES:
                # Get value from form
                value = data.get(feature_name, '0')
                full_features[i] = float(value)
            elif feature_name == 'Amount':
                # Amount is special - you might want this too
                full_features[i] = float(data.get('Amount', '0'))
            # All other features remain 0
        
        # Convert to numpy array and reshape
        features_array = np.array(full_features).reshape(1, -1)
        
        # Scale and predict
        scaled_features = scaler.transform(features_array)
        
        prediction = model.predict(scaled_features)[0]
        proba = model.predict_proba(scaled_features)[0]
        
        # Calculate percentages
        legit_prob = round(proba[0] * 100, 2)
        fraud_prob = round(proba[1] * 100, 2)
        
        result = "FRAUD" if prediction == 1 else "LEGITIMATE"
        
        # Determine risk level
        if fraud_prob > 70:
            risk = "HIGH"
            color = "danger"
        elif fraud_prob > 30:
            risk = "MEDIUM"
            color = "warning"
        else:
            risk = "LOW"
            color = "success"
        
        return jsonify({
            'success': True,
            'result': result,
            'fraud_prob': fraud_prob,
            'legit_prob': legit_prob,
            'risk': risk,
            'color': color
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False})

@app.route('/sample', methods=['GET'])
def sample_data():
    # Sample values for your 7 features
    sample = {
        'V1': -1.359807,
        'V2': -0.072781,
        'V3': 2.536347,
        'V4': 1.378155,
        'V5': -0.338321,
        'V6': 0.462388,
        'V7': 0.239599,
        'Amount': 149.62
    }
    return jsonify(sample)

if __name__ == '__main__':
    app.run(debug=True, port=5000)