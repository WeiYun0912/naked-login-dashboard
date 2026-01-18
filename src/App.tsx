import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Callback } from '@/pages/Callback';

function App() {
  // Get base path for GitHub Pages deployment
  const basename = import.meta.env.MODE === 'production' ? '/naked-login-dashboard' : '';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
