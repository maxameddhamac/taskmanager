import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminProtectedRoute from "./auth/components/AdminProtectedRoute";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import DashboardPage from "./components/dashboard/DashboardPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./auth/pages/LoginPage";
import RegisterPage from "./auth/pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminPage />
          </AdminProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
