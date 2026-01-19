import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { VideoDetail } from '@/pages/VideoDetail';
import { Callback } from '@/pages/Callback';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';

function App() {
  // Get base path for GitHub Pages deployment
  const basename = import.meta.env.MODE === 'production' ? '/naked-login-dashboard' : '';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/video/:videoId" element={<VideoDetail />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
      <PWAInstallPrompt />
    </BrowserRouter>
  );
}

export default App;
