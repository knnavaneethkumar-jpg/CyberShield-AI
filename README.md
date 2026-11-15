# CyberShield-AI
An AI-powered cybersecurity platform that scans files, messages, and URLs to detect threats. Using AI and Explainable AI (XAI), it identifies risks, provides risk scores, explains results, and offers security suggestions. Firebase securely stores scan history.

# CyberShield AI — Full Project

This ZIP contains the complete separated frontend and backend.

## Project layout

```text
CyberShield-AI/
├── frontend/
└── backend/
```

## Run backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and add GEMINI_API_KEY + AUTH_SECRET
npm run server
```

For ML inference:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
```

The supplied URL phishing model is included at `backend/ml/url_phishing_model_fixed.joblib` and is used for link scans. The optional unified multi-modal model can be placed at `backend/ml/unified_threat_model.joblib` for URL/text inference.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api` to the backend on port 4000.

## Authentication

- Registration: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Current user: `GET /api/auth/me`
- Passwords: salted `scrypt` hashes only
- Persistent files: `backend/data/registration.csv` and `backend/data/login.csv`
- Bearer tokens: signed JWTs with 7-day expiration

## CyberBot

The chatbot uses the Gemini API from the backend only. The browser never receives `GEMINI_API_KEY`. Chat history is normalized before it is sent to Gemini, and the chatbot requires authentication.

## Unified threat model

The project is wired to the supplied unified Random Forest model code for URL/text inference. The uploaded model package contained training/prediction code, but not a trained `.joblib` artifact or its datasets. Therefore the final ZIP includes the complete integration and will automatically report the ML model as unavailable until `backend/ml/unified_threat_model.joblib` is present.

## Smoke test

After both Node dependencies and Gemini are configured:

```bash
cd backend
node smoke-test.mjs
```

The smoke test registers a temporary user, logs in, checks the session, asks CyberBot a question, and submits a threat scan. It does not print passwords, tokens, or API keys.


## Chatbot and ML troubleshooting (fixed build)

CyberBot now returns useful offline safety guidance if Gemini is rate-limited or unavailable, and marks that response with `degraded: true`. HTTP 429 is a Gemini quota/rate-limit response; see Google's API troubleshooting guide: https://ai.google.dev/gemini-api/docs/troubleshooting. A fallback response is not a live Gemini answer. Check `backend/.env`, the model name, key permissions, and quota to restore live responses.

Check ML readiness at `GET http://localhost:4000/api/ml/status`. The supplied `unified_threat_detector.zip` contains `train_unified_model.py` and `predict_threat.py` but no trained `.joblib` model file. A real trained artifact and the required datasets are necessary for trained ML inference. Until then the rule scanner remains active and the response reports `mlModelAvailable: false`.


## Included URL phishing model

The uploaded `url_phishing_model_fixed.joblib` is bundled in `backend/ml/`. Install Python dependencies using `python3 -m pip install -r ml/requirements.txt` from the backend directory. The Express scan route invokes `predict_url_phishing.py` for URL/link inputs. Check `GET /api/ml/status`. The model uses estimated URL-only features for live requests; several training features require page/DNS/reputation data and are marked unknown, so treat predictions as triage—not proof of safety.

## CyberBot predefined/offline answers

The chatbot has clickable incident prompts in the left panel and suggested follow-up buttons. If Gemini is unavailable or the network request fails, the frontend now shows a relevant offline answer for phishing/scam links, clicked links, exposed credentials/OTPs, and Android/APK permissions instead of only showing an error bubble. The message explicitly marks the response as offline guidance.

## Admin login history

The Admin Panel now has a **User Login History** tab. It reads recent entries from `backend/data/login.csv` through `GET /api/admin/login-records`, displays each user's login date/time, successful/failed status and IP, and offers a refresh action. The endpoint requires a valid bearer token and an administrator email in `backend/.env` (`ADMIN_EMAILS`, comma-separated). It never returns registration password hashes.

Example backend configuration:

```env
ADMIN_EMAILS=knnavaneethkumar@gmail.com,madangowda@cybershield.ai
```

Restart the backend after changing `.env`. Sign in with an account whose email is in `ADMIN_EMAILS`, then open Admin Panel → **User Login History**. Login timestamps are stored as ISO-8601 UTC strings and displayed in the browser's local timezone. Failed attempts are included as well as successful logins.

The CSV files live under `backend/data/` for local development. If deploying to a hosting platform with an ephemeral filesystem, use a persistent disk or a database, otherwise the files may not survive redeploys.


### Live web information in CyberBot
CyberBot uses Gemini with Google Search grounding enabled by `GEMINI_GOOGLE_SEARCH=true` in `backend/.env`. When the model grounds an answer, the response includes source links. Keep the API key in backend environment variables only. Revoke and replace any key shared in chat or source control.

## Designated administrator login

Only the following account is authorized to open the Admin Panel:

- Email: `admin123@gamil.com`
- Initial password: `Admin@123`

The backend verifies this password using a precomputed Node.js `scrypt` hash. The raw password is not stored in the registration CSV or backend source. Public registration for the designated admin email is blocked. All other registered users are assigned the `user` role, land on Home after login, and do not see the Admin Panel navigation. The backend also restricts the admin login-records endpoint to the designated admin identity.

For production, change the initial admin password and set `ADMIN_PASSWORD_HASH` to a new `scrypt$<salt>$<hex-hash>` value in `backend/.env`; never deploy with a public/default password.

The login and registration pages include eye/eye-off buttons for the password and confirm-password fields.
