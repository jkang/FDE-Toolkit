import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout.jsx';

import DashboardPage from './pages/DashboardPage.jsx';

import TranslatePage from './pages/TranslatePage.jsx';

import RecommendPage from './pages/RecommendPage.jsx';

import DisposePage from './pages/DisposePage.jsx';

import ConfirmPage from './pages/ConfirmPage.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkbenchLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/translate" element={<TranslatePage />} />

          <Route path="/recommend" element={<RecommendPage />} />

          <Route path="/dispose" element={<DisposePage />} />

          <Route path="/confirm" element={<ConfirmPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}