import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout.jsx';

import DashboardPage from './pages/DashboardPage.jsx';

import CollectPage from './pages/CollectPage.jsx';

import ReconcilePage from './pages/ReconcilePage.jsx';

import PodmatchPage from './pages/PodmatchPage.jsx';

import PostingPage from './pages/PostingPage.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkbenchLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/collect" element={<CollectPage />} />

          <Route path="/reconcile" element={<ReconcilePage />} />

          <Route path="/podmatch" element={<PodmatchPage />} />

          <Route path="/posting" element={<PostingPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}