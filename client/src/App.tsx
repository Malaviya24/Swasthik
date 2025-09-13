import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/NavBar";
import Landing from "@/pages/landing";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Switch>
        <Route path="/" component={Landing}/>
        <Route path="/chat" component={Chat}/>
        <Route path="/symptom-checker" component={() => <div className="p-8"><h1>Symptom Checker - Coming Soon</h1></div>}/>
        <Route path="/medications" component={() => <div className="p-8"><h1>Medications - Coming Soon</h1></div>}/>
        <Route path="/health-centers" component={() => <div className="p-8"><h1>Health Centers - Coming Soon</h1></div>}/>
        <Route path="/reminders" component={() => <div className="p-8"><h1>Reminders - Coming Soon</h1></div>}/>
        <Route path="/health-news" component={() => <div className="p-8"><h1>Health News - Coming Soon</h1></div>}/>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
