import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { SwipeFile } from './pages/SwipeFile';
import { InspirationDetail } from './pages/InspirationDetail';
import { BrandDNA } from './pages/BrandDNA';
import { BrandKit } from './pages/BrandKit';
import { useSwipeStore } from './store';

export default function App() {
  const fetchInspirations = useSwipeStore((s) => s.fetchInspirations);

  useEffect(() => {
    fetchInspirations();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/swipe-file"    element={<SwipeFile />} />
          <Route path="/swipe-file/:id" element={<InspirationDetail />} />
          <Route path="/brand-dna"     element={<BrandDNA />} />
          <Route path="/brand-kit"     element={<BrandKit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
