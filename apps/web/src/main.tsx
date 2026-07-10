import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@frontier-isles/assets/tokens.css';
import './global.css';
import './i18n';
import App from './App';

const el = document.getElementById('root');
if (el) {
  const root = createRoot(el);
  // `?scene=pixi` mounts the M1 layered Pixi scene in isolation (dynamic import
  // keeps pixi.js out of the default bundle). Everything else renders the app.
  if (new URLSearchParams(location.search).get('scene') === 'pixi') {
    void import('./scene/PixiSceneHost').then(({ default: PixiSceneHost }) => {
      root.render(
        <StrictMode>
          <PixiSceneHost />
        </StrictMode>,
      );
    });
  } else {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}
