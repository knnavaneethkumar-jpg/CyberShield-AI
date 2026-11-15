const base = process.env.API_URL || 'http://localhost:4000';
const email = `smoke-${Date.now()}@example.com`;
const password = 'SmokeTestPassword123!';

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  console.log(`${options.method || 'GET'} ${path} -> ${res.status}`);
  if (!res.ok) {
    const code = data.code ? ` [${data.code}]` : '';
    throw new Error(`${data.error || `HTTP ${res.status}`}${code}`);
  }
  return data;
}

const health = await request('/api/health');
console.log('Health:', health);
if (!health.geminiConfigured) {
  console.warn('Gemini key is not configured; chatbot should use offline fallback.');
}

const registered = await request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name: 'Smoke Test User', email, password }),
});
if (!registered.token) throw new Error('Registration did not return a token');

const auth = { Authorization: `Bearer ${registered.token}` };
const me = await request('/api/auth/me', { headers: auth });
console.log('Authenticated user:', me.user.email);

const loggedIn = await request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
if (!loggedIn.token) throw new Error('Login did not return a token');

const chat = await request('/api/chat', {
  method: 'POST',
  headers: { Authorization: `Bearer ${loggedIn.token}` },
  body: JSON.stringify({
    language: 'en',
    history: [{ role: 'user', content: 'Explain in two short points how phishing works.' }],
  }),
});
console.log('CyberBot response:', chat.content.slice(0, 250));
console.log('CyberBot mode:', chat.degraded ? `offline fallback (${chat.fallbackReason || 'unavailable'})` : 'Gemini live');

const scan = await request('/api/scan', {
  method: 'POST',
  headers: { Authorization: `Bearer ${loggedIn.token}` },
  body: JSON.stringify({ type: 'message', input: 'Your bank account is blocked. Send your OTP immediately.' }),
});
console.log('Scan:', { classification: scan.classification, riskScore: scan.riskScore, mlModelAvailable: scan.mlModelAvailable, mlPrediction: scan.mlPrediction, mlError: scan.mlError });
const mlStatus = await request('/api/ml/status');
console.log('ML status:', mlStatus);

console.log('Smoke test completed. If available=false in ML status, install the trained .joblib artifact and required Python packages.');
