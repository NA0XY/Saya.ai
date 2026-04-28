import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { GoogleOAuthCallbackPage } from "./components/GoogleOAuthCallbackPage";
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
    path: "/auth/callback",
    Component: GoogleOAuthCallbackPage,
  },
  {
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

