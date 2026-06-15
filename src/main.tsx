import React from 'react';
import ReactDOM from 'react-dom/client';
import PoemGalaxyVideoClone from './PoemGalaxyVideoClone';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PoemGalaxyVideoClone />
    </React.StrictMode>
  );
}
