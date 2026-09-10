import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout.jsx';

import DashboardPage from './pages/DashboardPage.jsx';

import CollectionPage from './pages/CollectionPage.jsx';

import RecognitionPage from './pages/RecognitionPage.jsx';

import MatchingPage from './pages/MatchingPage.jsx';

import ExceptionsPage from './pages/ExceptionsPage.jsx';

import LedgerPage from './pages/LedgerPage.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkbenchLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/collection" element={<CollectionPage />} />

          <Route path="/recognition" element={<RecognitionPage />} />

          <Route path="/matching" element={<MatchingPage />} />

          <Route path="/exceptions" element={<ExceptionsPage />} />

          <Route path="/ledger" element={<LedgerPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}