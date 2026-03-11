import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Board from "./components/Board";
import PageNotFound from "./components/PageNotFound";
import Profile from "./components/Profile";
import AppLayout from "./components/AppLayout";
import DocumentEditor from "./components/DocumentEditor";
import LandingPage from "./components/LandingPage";
import WorkPage from "./components/WorkPage";
import WorkCategoryPage from "./components/WorkCategoryPage";
import ServicesPage from "./components/ServicesPage";
import CampaignsPage from "./components/CampaignsPage";
import AboutUsPage from "./components/AboutUsPage";
import ContactPage from "./components/ContactPage";
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/work/:category" element={<WorkCategoryPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Welcome */}
      <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

      {/* Protected – with sidebar */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
      <Route path="/boards/:id" element={<ProtectedRoute><AppLayout><Board /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/docs/:id" element={<ProtectedRoute><AppLayout><DocumentEditor /></AppLayout></ProtectedRoute>} />

      {/* Helpers */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;