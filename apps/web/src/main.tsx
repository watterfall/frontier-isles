import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@frontier-isles/assets/tokens.css';
import './global.css';
import './i18n';
import App from './App';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
