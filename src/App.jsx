import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import Medicines from "./pages/Medicines";
import AddMedicine from "./pages/AddMedicine";
import PrescriptionScan from "./pages/PrescriptionScan";
import OCRReview from "./pages/OCRReview";
import Appointments from "./pages/Appointments";
import Pharmacy from "./pages/Pharmacy";
import Profile from "./pages/Profile";

import { isAuthenticated } from "./services/authService";
import { startReminderScheduler } from "./services/remindersService";
import { requestNotificationPermission } from "./services/notifications/notificationService";


function ProtectedRoute({ children }) {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AppContent() {
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    let cleanup;

    async function startAppServices() {
      try {
        // Request Android notification permission
        await requestNotificationPermission();

        // Start existing medicine reminder scheduler
        const stopScheduler = await startReminderScheduler();

        cleanup = stopScheduler;
      } catch (error) {
        console.error(
          "App notification/reminder services failed:",
          error
        );
      }
    }

    startAppServices();

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [location.pathname]);

  return (
    <Routes>

      {/* Public Routes */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Registration />}
      />


      {/* Protected Routes */}

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicines"
        element={
          <ProtectedRoute>
            <Medicines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicines/add"
        element={
          <ProtectedRoute>
            <AddMedicine />
          </ProtectedRoute>
        }
      />

      <Route
        path="/prescription"
        element={
          <ProtectedRoute>
            <PrescriptionScan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/prescription/review"
        element={
          <ProtectedRoute>
            <OCRReview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute>
            <Pharmacy />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />


      {/* Default Route */}

      <Route
        path="/"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? "/home"
                : "/login"
            }
            replace
          />
        }
      />

      {/* Unknown Route */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? "/home"
                : "/login"
            }
            replace
          />
        }
      />

    </Routes>
  );
}


function App() {
  return <AppContent />;
}

export default App;