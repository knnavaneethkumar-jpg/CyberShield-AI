import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ScamAlertProvider } from './contexts/ScamAlertContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ScamAlertProvider>
          <App />
        </ScamAlertProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);

