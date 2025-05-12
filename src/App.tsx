
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudyRoutePage from "./pages/StudyRoutePage";
import ReflectionsPage from "./pages/ReflectionsPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AdminCreator from "./components/AdminCreator";

// Use LandingPage directly without wrapper since RankingPanel is now within it
const EnhancedLandingPage = () => <LandingPage />;

// Create a new query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Add retry and error handling for all queries
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      meta: {
        // Updated: Use meta for error handling instead of onError
        errorHandler: (error: Error) => {
          console.error('Query error:', error);
        },
      }
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<EnhancedLandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/upgrade-pro" element={<AdminCreator />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <>
                      <NavBar />
                      <DashboardPage />
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/study-route" 
                element={
                  <ProtectedRoute>
                    <>
                      <NavBar />
                      <StudyRoutePage />
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reflections" 
                element={
                  <ProtectedRoute>
                    <>
                      <NavBar />
                      <ReflectionsPage />
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/achievements" 
                element={
                  <ProtectedRoute>
                    <>
                      <NavBar />
                      <AchievementsPage />
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <>
                      <NavBar />
                      <ProfilePage />
                    </>
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect for old paths */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
