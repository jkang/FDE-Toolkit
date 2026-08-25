import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout.jsx';

import DashboardPage from './pages/DashboardPage.jsx';

import ChatQuotePage from './pages/ChatQuotePage.jsx';

import RecommendConfirmPage from './pages/RecommendConfirmPage.jsx';

import DocumentSiPage from './pages/DocumentSiPage.jsx';

import TrackingAlertPage from './pages/TrackingAlertPage.jsx';

import PaymentAftercarePage from './pages/PaymentAftercarePage.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkbenchLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/chat-quote" element={<ChatQuotePage />} />

          <Route path="/recommend-confirm" element={<RecommendConfirmPage />} />

          <Route path="/document-si" element={<DocumentSiPage />} />

          <Route path="/tracking-alert" element={<TrackingAlertPage />} />

          <Route path="/payment-aftercare" element={<PaymentAftercarePage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}