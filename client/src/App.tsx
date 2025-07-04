import { Switch, Route } from "wouter";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import StockManagement from "@/pages/StockManagement";
import TransactionLog from "@/pages/TransactionLog";
import UserManagement from "@/pages/UserManagement";

import Layout from "@/components/Layout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route component={Login} />
        </>
      ) : (
        <Layout>
          <Switch>
            <Route path="/" component={() => {
              // Redirect stock managers directly to stock management
              const userRole = (user as any)?.role;
              
              if (userRole === 'stock_in_manager' || userRole === 'stock_out_manager') {
                return <StockManagement />;
              }
              return <Home />;
            }} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/stock-management" component={StockManagement} />
            <Route path="/transactions" component={TransactionLog} />
            <Route path="/users" component={UserManagement} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      )}
    </Switch>
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
