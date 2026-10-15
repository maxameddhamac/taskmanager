import ProtectedRoute from "./ProtectedRoute";

const AdminProtectedRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export default AdminProtectedRoute;
