import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/interview";
import Resume from "./pages/Resume";
import Analytics from "./pages/analytics";
import Roadmap from "./pages/Roadmap";
import Settings from "./pages/Settings";
import { useAuthStore } from "./store/authStore";

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/" />;
}

function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <Dashboard>{children}</Dashboard>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <div />
            </AppLayout>
          }
        />
        <Route
          path="/interview"
          element={
            <AppLayout>
              <Interview />
            </AppLayout>
          }
        />
        <Route
          path="/resume"
          element={
            <AppLayout>
              <Resume />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <Analytics />
            </AppLayout>
          }
        />
        <Route
          path="/roadmap"
          element={
            <AppLayout>
              <Roadmap />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
