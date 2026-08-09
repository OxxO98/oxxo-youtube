import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { initializeI18n } from './app/i18n';

const bootstrap = async () => {
  const settings = await window.settingsAPI?.getInitialSettings();
  const language = settings?.general.language ?? 'ko';

  await initializeI18n(language);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  reportWebVitals();
};

void bootstrap();
