import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CropAdvisory from "./pages/CropAdvisory";
import FarmInstructor from "./pages/FarmInstructor";
import FarmAutomation from "./pages/FarmAutomation";
import DiseasePrediction from "./pages/DiseasePrediction";
import MarketAnalysis from "./pages/MarketAnalysis";
import ConnectMarket from "./pages/ConnectMarket";
import CropPrevention from "./pages/CropPrevention";
import FertilizerCalculator from "./pages/FertilizerCalculator";
import Chatbot from "./pages/Chatbot";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop-advisory" element={<CropAdvisory />} />
        <Route path="/farm-instructor" element={<FarmInstructor />} />
        <Route path="/farm-automation" element={<FarmAutomation />} />
        <Route path="/disease-prediction" element={<DiseasePrediction />} />
        <Route path="/market-analysis" element={<MarketAnalysis />} />
        <Route path="/connect-market" element={<ConnectMarket />} />
        <Route path="/crop-prevention" element={<CropPrevention />} />
        <Route path="/fertilizer-calculator" element={<FertilizerCalculator />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  </TooltipProvider>
</QueryClientProvider>);
export default App;
