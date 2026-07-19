import React from 'react';
import ReactDOM from 'react-dom/client';
import { PoemGalaxyApp } from './app/PoemGalaxyApp';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point');
const forceStatic = new URLSearchParams(window.location.search).get('static') === '1';

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PoemGalaxyApp forceStatic={forceStatic} />
  </React.StrictMode>
);
