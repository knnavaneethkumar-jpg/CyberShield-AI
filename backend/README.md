# CyberShield AI Backend

Express backend for authentication, Gemini CyberBot, threat scanning, CSV persistence, and the unified ML model.

## 1. Install

```bash
npm install
```

For ML inference, create a Python environment and install:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
```

## 2. Configure

Copy `.env.example` to `.env` and set:

- `GEMINI_API_KEY` — backend-only Gemini API key
- `AUTH_SECRET` — random secret of at least 32 characters
- `GEMINI_MODEL` — defaults to `gemini-3.8-flash`
- `ML_ENABLED=true` and `PYTHON_BIN=python3`

Never commit `.env`, CSV data, or a trained model containing private data.

## 3. Unified ML model

The integration is already wired to:

```text
ml/unified_threat_model.joblib
```

The supplied model package contains the training and prediction code, but the uploaded package did not contain the trained `.joblib` artifact or the required training datasets. Place your trained artifact at the path above.

Train with:

```bash
python3 ml/train_unified_model.py \
  --url PhishingData.csv \
  --sms sms.csv \
  --apk apk_features.csv \
  --output ml/unified_threat_model.joblib
```

Do not execute unknown APKs. The APK branch expects extracted static numeric features.

## 4. Start

```bash
npm run server
```

The API listens on `http://localhost:4000`.

## 5. Authentication storage

The local project persists authentication data in:

```text
data/registration.csv
data/login.csv
```

Passwords are stored only as salted `scrypt` hashes. Login attempts are recorded without storing passwords.

## 6. CyberBot

The frontend sends chat requests to `POST /api/chat`. The backend adds the authenticated user context and sends the cleaned multi-turn conversation to Gemini. The Gemini API key never reaches the browser.

If the chatbot returns `Gemini authentication failed`, check `GEMINI_API_KEY` and restart the backend.


## Gemini live cybersecurity information

Set `GEMINI_API_KEY` in `backend/.env` and keep it out of source control. `GEMINI_GOOGLE_SEARCH=true` enables Gemini Google Search grounding so CyberBot can retrieve current public cybersecurity information when relevant. Grounded answers include source links when Google returns grounding metadata. Search grounding can consume API quota/billing. Set `GEMINI_GOOGLE_SEARCH=false` to disable it.

If an API key was pasted into a chat, screenshot, commit, or shared document, revoke it in Google AI Studio and generate a new one before deployment. Never place the key in Vite variables or frontend source.
