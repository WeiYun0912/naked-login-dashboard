import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Handle GitHub Pages SPA redirect
(function() {
  const redirectPathname = sessionStorage.getItem('spa_redirect_pathname');
  const redirectHash = sessionStorage.getItem('spa_redirect_hash');
  
  if (redirectPathname) {
    sessionStorage.removeItem('spa_redirect_pathname');
    sessionStorage.removeItem('spa_redirect_hash');
    
    // Restore the original URL
    const fullPath = redirectPathname + (redirectHash || '');
    window.history.replaceState(null, '', fullPath);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
