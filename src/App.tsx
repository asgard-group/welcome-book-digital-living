import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthGate } from "@/components/AuthGate";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Access from "./pages/Access";
import Admin from "./pages/Admin";
import Checkin from "./pages/Checkin";
import Checkout from "./pages/Checkout";
import Rules from "./pages/Rules";
import Facilities from "./pages/Facilities";
import Services from "./pages/Services";
import Explore from "./pages/Explore";
import InfoPage from "./pages/InfoPage";
import QrPage from "./pages/QrPage";
import Thanks from "./pages/Thanks";
import NotFound from "./pages/NotFound";

const OnboardingGate = () => {
  let seen = false;
  try {
    seen = typeof window !== "undefined" && localStorage.getItem("joro_onboarded") === "1";
  } catch {
    // Ignore storage failures (e.g. private mode / disabled storage).
  }
  return seen ? <Navigate to="/home" replace /> : <Onboarding />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public: magic-link landing (no valid session yet) */}
              <Route path="/access" element={<Access />} />

              {/* Public: admin login + grant issuance, gated by its own server-side password */}
              <Route path="/admin" element={<Admin />} />

              {/* Everything else requires a valid, in-window access grant */}
              <Route element={<AuthGate />}>
                <Route path="/" element={<OnboardingGate />} />
                <Route path="/home" element={<Welcome />} />
                <Route path="/checkin" element={<Checkin />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/services" element={<Services />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/info" element={<InfoPage />} />
                <Route path="/qr" element={<QrPage />} />
                <Route path="/thanks" element={<Thanks />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
