## 💳 Credit Card Fraud Detection Web Application

A machine learning–based web application that detects fraudulent credit card transactions using an XGBoost classification model and a Flask backend.

## 🔍 Project Overview

This project aims to identify whether a credit card transaction is Fraudulent or Legitimate based on transaction data.

Due to privacy protection, real-world credit card datasets use PCA-transformed features (V1–V28) instead of raw user details.
To keep the system realistic and secure:

PCA features are handled internally

Users interact with meaningful inputs like transaction amount

The model predicts fraud without exposing sensitive data

This approach makes the application conceptually correct and industry-aligned.

## ⚙️ Tech Stack

Programming Language: Python

Backend: Flask

Machine Learning: XGBoost

Model Persistence: Joblib

Frontend:

HTML

CSS

JavaScript

## 🧠 Machine Learning Model

Algorithm Used: XGBoost Classifier

Input Features:

PCA-transformed features (V1–V28) (internally handled)

Transaction Amount

Output:

0 → Legitimate Transaction

1 → Fraudulent Transaction

The model is trained on a PCA-transformed credit card transactions dataset to ensure privacy and accuracy.

## 🖥️ Application Workflow

User opens the web application

User enters transaction details (e.g., amount)

System processes and scales the input data

Trained XGBoost model evaluates the transaction

Result is displayed on the UI:

✅ Legitimate Transaction

🚨 Fraud Detected

## 🚀 How to Run the Project Locally
1️⃣ Clone the Repository
git clone https://github.com/liyana00/credit-card-fraud-detection.git
cd credit-card-fraud-detection
