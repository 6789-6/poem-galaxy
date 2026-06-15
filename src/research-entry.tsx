import React from 'react';
import ReactDOM from 'react-dom/client';
import AppResearch from './AppResearch';
import './styles.css';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppResearch />
    </React.StrictMode>
  );
}
