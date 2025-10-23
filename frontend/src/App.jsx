import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import PropertyForm from "./pages/PropertyForm";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyDashboard from "./pages/PteamDashboard";
import LegalDashboard from "./pages/LteamDashboard";
import TokenDashboard from "./pages/TteamDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import FinanceDashboard from "./pages/FteamDashboard";
import TechTeamDashboard from "./pages/TechteamDashboard";
import PurchaseHeadDashboard from "./pages/PurchaseHeadDashboard";
import { useAuth } from "./hooks/useAuth";


export default function App() {
  const { user } = useAuth();
  console.log("Current user:", user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
 
        <Route
          path="/lteam-dashboard"
          element={
            <ProtectedRoute allowedRoles={["legal"]}>
              <LegalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pteam-dashboard"
          element={
            <ProtectedRoute allowedRoles={["property"]}>
              <PropertyDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/tteam-dashboard"
          element={
            <ProtectedRoute allowedRoles={["token"]}>
              <TokenDashboard />
            </ProtectedRoute>
          }
        />

<Route
  path="/Fteam-dashboard"
  element={
    <ProtectedRoute allowedRoles={["finance"]}>
      <FinanceDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/Techteam-dashboard"
  element={
    <ProtectedRoute allowedRoles={["tech"]}>
      <TechTeamDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/PurchaseHead-dashboard"
  element={
    <ProtectedRoute allowedRoles={["purchase"]}>
      <PurchaseHeadDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/submit-property"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <PropertyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PropertyDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
