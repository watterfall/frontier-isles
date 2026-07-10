import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@frontier-isles/assets/tokens.css';
import './global.css';
import './i18n';
import App from './App';

const el = document.getElementById('root');
if (el) {
  const root = createRoot(el);
  const params = new URLSearchParams(location.search);
  // `?scene=pixi` mounts the M1 layered Pixi scene in isolation; `?atlas=pixi`
  // mounts the L0 图集 camera + semantic-LOD demo (Phase C1+C2). Both dynamic-
  // import so pixi.js stays out of the default bundle. Everything else = the app.
  if (params.get('scene') === 'pixi') {
    void import('./scene/PixiSceneHost').then(({ default: PixiSceneHost }) => {
      root.render(
        <StrictMode>
          <PixiSceneHost />
        </StrictMode>,
      );
    });
  } else if (params.get('atlas') === 'pixi') {
    void import('./chart/AtlasPixiHost').then(({ default: AtlasPixiHost }) => {
      root.render(
        <StrictMode>
          <AtlasPixiHost />
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
