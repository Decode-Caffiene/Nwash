import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import OverviewPage from "../pages/Overview/OverviewPage";
import RegulatoryRoadmapPage from "../pages/RegulatoryRoadmap/RegulatoryRoadmapPage";
import ServiceProvidersPage from "../pages/ServiceProviders/ServiceProvidersPage";
import GISMapPage from "../pages/GISMap/GISMapPage";
import DevelopmentPartnersPage from "../pages/DevelopmentPartners/DevelopmentPartnersPage";
import ResearchPage from "../pages/Research/ResearchPage";
import AnalyticsPage from "../pages/Analytics/AnalyticsPage";
import DownloadsPage from "../pages/Downloads/DownloadsPage";
import AdminPage from "../pages/Admin/AdminPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="regulatory-roadmap" element={<RegulatoryRoadmapPage />} />
        <Route path="service-providers" element={<ServiceProvidersPage />} />
        <Route path="gis-map" element={<GISMapPage />} />
        <Route
          path="development-partners"
          element={<DevelopmentPartnersPage />}
        />
        <Route path="research" element={<ResearchPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="downloads" element={<DownloadsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
