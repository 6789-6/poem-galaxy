import React from 'react';
import { createRoot } from 'react-dom/client';
import { PoetryGlobeAppFloating } from './PoetryGlobeAppFloating';
import './poetry-globe.css';
import './poetry-globe-pro.css';
import './poetry-globe-floating.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PoetryGlobeAppFloating />
  </React.StrictMode>
);
