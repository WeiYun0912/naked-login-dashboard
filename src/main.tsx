import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Handle GitHub Pages SPA redirect
(function() {
  const redirectPath = sessionStorage.getItem('redirect_path');
  const redirectHash = sessionStorage.getItem('redirect_hash');
  
  if (redirectPath) {
    sessionStorage.removeItem('redirect_path');
    sessionStorage.removeItem('redirect_hash');
    
    // Reconstruct the full path with hash
    const fullPath = '/' + redirectPath + (redirectHash || '');
    window.history.replaceState(null, '', fullPath);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
