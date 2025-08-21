import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import Dashboard from "./Pages/Dashboard/Dashboard";
import AbsenHarian from "./Pages/AbsenHarian/AbsenHarian";
import RiwayatAbsen from "./Pages/RiwayatAbsen/RiwayatAbsen";
import Pengumuman from "./Pages/Pengumuman/Pengumuman";
import NotFound from "./Pages/NotFound/NotFound";
import { ROLES } from "./utils/roleUtils";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes group */}
          <Route
            element={
              <ProtectedRoute allowedRoles={[ROLES.KEPALA_DESA, ROLES.STAF]}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/absen-harian" element={<AbsenHarian />} />
            <Route path="/riwayat-absen" element={<RiwayatAbsen />} />
            <Route path="/pengumuman" element={<Pengumuman />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
