from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional
import pickle
import numpy as np
import uvicorn
import os

MODEL_PATH = os.getenv("MODEL_PATH", "churn_model_pipeline.pkl")

# ---------- Load pipeline once ----------
with open(MODEL_PATH, 'rb') as f:
    pipeline = pickle.load(f)

# ---------- API ----------
app = FastAPI(title="Telecom Churn API", version="1.0.0")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Input Schema (aligns with training columns) -----
YesNo = Literal['Yes', 'No']
PaymentMethod = Literal['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']
Contract = Literal['Month-to-month', 'One year', 'Two year']
InternetService = Literal['DSL', 'Fiber optic', 'No']
gender = Literal['Male', 'Female']

class ChurnRequest(BaseModel):
    # numeric
    TotalCharges: float = Field(..., ge=0)
    MonthlyCharges: float = Field(..., ge=0)
    tenure: float = Field(..., ge=0)

    # binary-style columns (match your preprocessing expectations)
    SeniorCitizen: int = Field(..., ge=0, le=1)  # dataset uses 0/1
    Partner: YesNo
    Dependents: YesNo
    PhoneService: YesNo
    MultipleLines: YesNo
    OnlineSecurity: YesNo
    OnlineBackup: YesNo
    DeviceProtection: YesNo
    TechSupport: YesNo
    StreamingTV: YesNo
    StreamingMovies: YesNo
    PaperlessBilling: YesNo

    # categoricals
    PaymentMethod: PaymentMethod
    Contract: Contract
    InternetService: InternetService
    gender: gender

class ChurnResponse(BaseModel):
    churn: YesNo
    probability: float  # probability of churn == 'Yes'

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/labels")
def labels():
    return {
        "YesNo": ["Yes", "No"],
        "PaymentMethod": [
            'Electronic check', 'Mailed check',
            'Bank transfer (automatic)', 'Credit card (automatic)'
        ],
        "Contract": ['Month-to-month', 'One year', 'Two year'],
        "gender" : ['Male', 'Female'],
        "InternetService": ['DSL', 'Fiber optic', 'No']
    }

@app.post("/predict", response_model=ChurnResponse)
def predict(payload: ChurnRequest):
    # Convert input to a single-row dict consistent with original features
    data = {k: v for k, v in payload.model_dump().items()}

    # Create 2D structure for a single prediction
    import pandas as pd
    X = pd.DataFrame([data])

    # Predict class and proba
    proba_yes = float(pipeline.predict_proba(X)[0][1])
    pred = 'Yes' if proba_yes >= 0.5 else 'No'

    return {"churn": pred, "probability": round(proba_yes, 4)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
