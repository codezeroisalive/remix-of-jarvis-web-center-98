
import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Startup from "./pages/Startup";
import JarvisInterface from "./pages/JarvisInterface";
import ImageGeneration from "./pages/ImageGeneration";
import JarvisSettings from "./components/JarvisSettings";
import JarvisModeEnhancer from './components/JarvisModeEnhancer';
import { JarvisChatProvider } from "./contexts/JarvisChatProvider";
import ErrorBoundary from './components/ErrorBoundary';
import FeaturesOverview from "./pages/FeaturesOverview";
import SatelliteSurveillancePage from "./pages/SatelliteSurveillance";
import OSINTSearch from "./pages/OSINTSearch";
import { AuthProvider } from "./contexts/AuthContext";
import { WeatherContextProvider } from "./features/WeatherContext";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import JarvisModeSwitcher from "./components/JarvisModeSwitcher";
import JarvisV2Interface from "./pages/JarvisV2Interface";
import JarvisOS from "./components/jarvisOS/JarvisOS";
import OAuthConsent from "./pages/OAuthConsent";
import AgentConnection from "./pages/AgentConnection";
import SecurityLayout from "./pages/security/SecurityLayout";
import SecurityDashboard from "./pages/security/Dashboard";
import LiveCameras from "./pages/security/LiveCameras";
import Cameras from "./pages/security/Cameras";
import SecurityMap from "./pages/security/SecurityMap";
import SecurityPeople from "./pages/security/People";
import SecurityVehicles from "./pages/security/Vehicles";
import SecurityAlerts from "./pages/security/Alerts";
import SecurityEvents from "./pages/security/Events";
import SecurityZones from "./pages/security/Zones";
import SecurityAssistant from "./pages/security/Assistant";
import SecurityReports from "./pages/security/Reports";
import SecurityAuditLogs from "./pages/security/AuditLogs";
import SecuritySettings from "./pages/security/Settings";
import JSLayout from "./pages/js/JSLayout";
import JSHome from "./pages/js/JSHome";
import JSProjectLab from "./pages/js/JSProjectLab";
import JSCodeLab from "./pages/js/JSCodeLab";
import JSLibrary from "./pages/js/JSLibrary";
import { JSProjectDetail, JSBuild, JSBudget, JSDesigner, JSExperiment, JSKnowledge, JSJudge, JSDataLab, JSSaved } from "./pages/js/JSPages";


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <JarvisChatProvider>
          <WeatherContextProvider>
            <div className="app-container">
              <JarvisModeEnhancer>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                  <Route path="/connect" element={<ProtectedRoute><AgentConnection /></ProtectedRoute>} />
                  <Route path="/startup" element={<Startup />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <JarvisOS />
                    </ProtectedRoute>
                  } />
                  <Route path="/interface" element={<ProtectedRoute><JarvisInterface /></ProtectedRoute>} />
                  <Route path="/jarvis" element={<ProtectedRoute><JarvisInterface /></ProtectedRoute>} /> 
                  <Route path="/jarvis-v2" element={<ProtectedRoute><JarvisV2Interface /></ProtectedRoute>} />
                  <Route path="/code-zero" element={<ProtectedRoute><JarvisV2Interface /></ProtectedRoute>} />
                  <Route path="/ghost" element={<ProtectedRoute><JarvisV2Interface /></ProtectedRoute>} />
                  <Route path="/image-generation" element={<ProtectedRoute><ImageGeneration /></ProtectedRoute>} />
                  <Route path="/images" element={<ProtectedRoute><ImageGeneration /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><JarvisSettings /></ProtectedRoute>} />
                  <Route path="/features" element={<ProtectedRoute><FeaturesOverview /></ProtectedRoute>} />
                  <Route path="/satellite" element={<ProtectedRoute><SatelliteSurveillancePage /></ProtectedRoute>} />
                  <Route path="/osint" element={<ProtectedRoute><OSINTSearch /></ProtectedRoute>} />
                  <Route path="/security" element={<ProtectedRoute><SecurityLayout /></ProtectedRoute>}>
                    <Route index element={<SecurityDashboard />} />
                    <Route path="live" element={<LiveCameras />} />
                    <Route path="cameras" element={<Cameras />} />
                    <Route path="map" element={<SecurityMap />} />
                    <Route path="people" element={<SecurityPeople />} />
                    <Route path="vehicles" element={<SecurityVehicles />} />
                    <Route path="alerts" element={<SecurityAlerts />} />
                    <Route path="events" element={<SecurityEvents />} />
                    <Route path="zones" element={<SecurityZones />} />
                    <Route path="assistant" element={<SecurityAssistant />} />
                    <Route path="reports" element={<SecurityReports />} />
                    <Route path="audit" element={<SecurityAuditLogs />} />
                    <Route path="settings" element={<SecuritySettings />} />
                  </Route>
                  <Route path="/js-center" element={<ProtectedRoute><JSLayout /></ProtectedRoute>}>
                    <Route index element={<JSHome />} />
                    <Route path="lab" element={<JSProjectLab />} />
                    <Route path="project/:id" element={<JSProjectDetail />} />
                    <Route path="knowledge" element={<JSKnowledge />} />
                    <Route path="build" element={<JSBuild />} />
                    <Route path="experiment" element={<JSExperiment />} />
                    <Route path="judge" element={<JSJudge />} />
                    <Route path="budget" element={<JSBudget />} />
                    <Route path="designer" element={<JSDesigner />} />
                    <Route path="code" element={<JSCodeLab />} />
                    <Route path="library" element={<JSLibrary />} />
                    <Route path="data" element={<JSDataLab />} />
                    <Route path="saved" element={<JSSaved />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </JarvisModeEnhancer>
            </div>
            <div style={{ position: 'fixed', bottom: '0', right: '0', zIndex: '1000' }}>
              <JarvisModeSwitcher />
            </div>
          </WeatherContextProvider>
        </JarvisChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
