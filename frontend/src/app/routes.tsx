import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { OnboardingPage } from "./components/onboarding/OnboardingPage";
import { DashboardPage } from "./components/DashboardPage";
import { PrescriptionUploadPage } from "./components/prescription/PrescriptionUploadPage";
import { CompanionInterface } from "./components/companion/CompanionInterface";

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
    path: "/onboarding",
    Component: OnboardingPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
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
