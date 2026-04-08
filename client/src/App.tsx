/**
 * App.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "oklch(0.18 0.012 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "oklch(0.94 0.005 240)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: "600",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
