import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import AdminLoginPage from "../pages/Auth/AdminLoginPage";
import OverviewPage from "../pages/Overview/OverviewPage";
import RegulatoryRoadmapPage from "../pages/RegulatoryRoadmap/RegulatoryRoadmapPage";
import ServiceProvidersPage from "../pages/ServiceProviders/ServiceProvidersPage";
import GISMapPage from "../pages/GISMap/GISMapPage";
import DevelopmentPartnersPage from "../pages/DevelopmentPartners/DevelopmentPartnersPage";
import ResearchPage from "../pages/Research/ResearchPage";
import AnalyticsPage from "../pages/Analytics/AnalyticsPage";
import DownloadsPage from "../pages/Downloads/DownloadsPage";
import DataEntryPage from "../pages/DataEntry/DataEntryPage";
import ViewUploadedDataPage from "../pages/ViewData/ViewUploadedDataPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";

function AppRouter() {
  return (
    <Routes>
      {/* Full-screen login — no sidebar or navbar */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Main app shell */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/overview" replace />} />

        {/* Public routes — no auth required */}
        <Route path="overview" element={<OverviewPage />} />
        <Route path="regulatory-roadmap" element={<RegulatoryRoadmapPage />} />
        <Route path="service-providers" element={<ServiceProvidersPage />} />
        <Route path="gis-map" element={<GISMapPage />} />
        <Route path="development-partners" element={<DevelopmentPartnersPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="downloads" element={<DownloadsPage />} />
        <Route path="data-entry" element={<DataEntryPage />} />

        {/* Admin-only routes — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<Navigate to="/view-data" replace />} />
          <Route path="view-data" element={<ViewUploadedDataPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
