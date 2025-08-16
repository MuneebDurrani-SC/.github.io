import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard.jsx';

// Optional: preload a default logo from /public if empty in localStorage
const defaultLogo = '/logo.png';
if (!localStorage.getItem('logo')) {
  fetch(defaultLogo, { method: 'HEAD' }).then(res => {
    if (res.ok) localStorage.setItem('logo', defaultLogo);
  }).catch(()=>{});
}

const root = createRoot(document.getElementById('root'));
root.render(<Dashboard />);
