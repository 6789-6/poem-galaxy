import React from 'react';
import { createRoot } from 'react-dom/client';
import { PoetryGlobeApp } from './PoetryGlobeApp';
import './poetry-globe.css';
import './poetry-globe-pro.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PoetryGlobeApp />
  </React.StrictMode>
);
