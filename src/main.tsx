import React from 'react';
import ReactDOM from 'react-dom/client';
import './runtime/preloadRecover';
import AppEnhanced from './AppEnhanced';
import './styles.css';
import './video.css';
import './quality.css';
import './observatory.css';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppEnhanced />
    </React.StrictMode>
  );
}
