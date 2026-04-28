import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
<<<<<<< HEAD
=======
import { GoogleOAuthCallbackPage } from "./components/GoogleOAuthCallbackPage";
import { OnboardingPage } from "./components/onboarding/OnboardingPage";
>>>>>>> 5cf29c319fe07faac5b03434cf92c6bedee1c7f0
import { DashboardPage } from "./components/DashboardPage";
import { PrescriptionUploadPage } from "./components/prescription/PrescriptionUploadPage";
import { CompanionInterface } from "./components/companion/CompanionInterface";
import { SettingsPage } from "./components/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
<<<<<<< HEAD
=======
    path: "/auth/callback",
    Component: GoogleOAuthCallbackPage,
  },
  {
    path: "/onboarding",
    Component: OnboardingPage,
  },
  {
>>>>>>> 5cf29c319fe07faac5b03434cf92c6bedee1c7f0
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/dashboard/settings",
    Component: SettingsPage,
  },
  {
    path: "/prescription-upload",
    Component: PrescriptionUploadPage,
  },
  {
    path: "/companion",
    Component: CompanionInterface,
  },
]);

