import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout.jsx';

import WorkbenchPage from './pages/WorkbenchPage.jsx';

import SupplyOverviewPage from './pages/SupplyOverviewPage.jsx';

import AllocationPage from './pages/AllocationPage.jsx';

import ExceptionPage from './pages/ExceptionPage.jsx';

import ReplenishPage from './pages/ReplenishPage.jsx';

import ReviewPage from './pages/ReviewPage.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkbenchLayout />}>
          <Route index element={<Navigate to="/workbench" replace />} />

          <Route path="/workbench" element={<WorkbenchPage />} />

          <Route path="/supply" element={<SupplyOverviewPage />} />

          <Route path="/allocation" element={<AllocationPage />} />

          <Route path="/exception" element={<ExceptionPage />} />

          <Route path="/replenish" element={<ReplenishPage />} />

          <Route path="/review" element={<ReviewPage />} />

          <Route path="*" element={<Navigate to="/workbench" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}