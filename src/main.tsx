import React from 'react';
import ReactDOM from 'react-dom/client';
import { PoemGalaxyApp } from './app/PoemGalaxyApp';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PoemGalaxyApp />
  </React.StrictMode>
);
