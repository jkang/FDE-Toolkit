import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout.jsx';

import DashboardPage from './pages/DashboardPage.jsx';

import IngestPage from './pages/IngestPage.jsx';

import ScriptClipPage from './pages/ScriptClipPage.jsx';

import PlatformAdaptPage from './pages/PlatformAdaptPage.jsx';

import ReviewPublishPage from './pages/ReviewPublishPage.jsx';

import FeedbackPage from './pages/FeedbackPage.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkbenchLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/ingest" element={<IngestPage />} />

          <Route path="/script-clip" element={<ScriptClipPage />} />

          <Route path="/platform-adapt" element={<PlatformAdaptPage />} />

          <Route path="/review-publish" element={<ReviewPublishPage />} />

          <Route path="/feedback" element={<FeedbackPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}