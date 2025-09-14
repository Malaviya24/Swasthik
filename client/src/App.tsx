import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/NavBar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Landing from "@/pages/landing";
import Chat from "@/pages/chat";
import SymptomCheckerPage from "@/pages/symptom-checker-page";
import MedicationsPage from "@/pages/medications-page";
import HealthCentersPage from "@/pages/health-centers-page";
import RemindersPage from "@/pages/reminders-page";
import HealthNewsPage from "@/pages/health-news-page";
import { TestPage } from "@/pages/test-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Switch>
        <Route path="/" component={Landing}/>
        <Route path="/chat" component={Chat}/>
        <Route path="/symptom-checker" component={SymptomCheckerPage}/>
        <Route path="/medications" component={MedicationsPage}/>
        <Route path="/health-centers" component={HealthCentersPage}/>
        <Route path="/reminders" component={RemindersPage}/>
        <Route path="/health-news" component={HealthNewsPage}/>
        <Route path="/test" component={TestPage}/>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
