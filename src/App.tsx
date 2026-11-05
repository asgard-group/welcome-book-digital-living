import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { BuildingGate } from "@/components/BuildingGate";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Access from "./pages/Access";
import Admin from "./pages/Admin";
import Checkin from "./pages/Checkin";
import Checkout from "./pages/Checkout";
import Facilities from "./pages/Facilities";
import Services from "./pages/Services";
import Explore from "./pages/Explore";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";

/** Onboarding is per building: seeing it for one address doesn't skip it for another. */
const OnboardingGate = () => {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  let seen = false;
  try {
    seen = typeof window !== "undefined" && localStorage.getItem(`joro_onboarded_${buildingSlug}`) === "1";
  } catch {
    // Ignore storage failures (e.g. private mode / disabled storage).
  }
  return seen ? <Navigate to={`/${buildingSlug}/home`} replace /> : <Onboarding />;
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
              {/* Public: magic-link landing (no valid session yet). Static paths win over :buildingSlug. */}
              <Route path="/access" element={<Access />} />

              {/* Public: admin login + link issuance, gated by its own server-side password */}
              <Route path="/admin" element={<Admin />} />

              {/* Bare root: there is no default apartment — a guest needs their own link */}
              <Route path="/" element={<Navigate to="/admin" replace />} />

              {/* One apartment per sub-URL (e.g. /haussmann-halevy-1/*), only reachable with a valid magic link. */}
              <Route path="/:buildingSlug" element={<BuildingGate />}>
                <Route index element={<OnboardingGate />} />
                <Route path="home" element={<Welcome />} />
                <Route path="checkin" element={<Checkin />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="facilities" element={<Facilities />} />
                <Route path="services" element={<Services />} />
                <Route path="explore" element={<Explore />} />
                <Route path="info" element={<InfoPage />} />
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
