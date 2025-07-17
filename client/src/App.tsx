import { useState } from "react";
import { Switch, Route } from "wouter";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import HomeNew from "@/pages/Home-new";
import Inventory from "@/pages/Inventory";
import MasterInventory from "@/pages/MasterInventory";
import StockManagement from "@/pages/StockManagement";
import TransactionLog from "@/pages/TransactionLog";
import UserManagement from "@/pages/UserManagement";
import WeeklyStockPlanning from "@/pages/WeeklyStockPlanning";
import ProductCatalog from "@/pages/ProductCatalog";

import Layout from "@/components/Layout";
import SplashScreen from "@/components/SplashScreen";

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
          {/* <Route path="/" component={Login} />
          <Route path="/login" component={Login} /> */}
          <Route component={Login} />
        </>
      ) : (
        <Layout>
          <Switch>
            <Route
              path="/"
              component={() => {
                // Get user's active roles (support both single role and multiple roles)
                const userRoles = (user as any)?.roles || [(user as any)?.role];
                const hasRole = (role: string) => userRoles.includes(role);
                
                // Check if user has multiple roles - if so, show the multi-role dashboard
                if (userRoles.length > 1) {
                  return <HomeNew />;
                }
                
                // For users with single roles, redirect to their specific functionality
                if (hasRole("stock_in_manager") && !hasRole("stock_out_manager") && !hasRole("master_inventory_handler")) {
                  return <StockManagement />;
                }
                if (hasRole("stock_out_manager") && !hasRole("stock_in_manager") && !hasRole("master_inventory_handler")) {
                  return <StockManagement />;
                }
                if (hasRole("master_inventory_handler") && !hasRole("stock_in_manager") && !hasRole("stock_out_manager")) {
                  return <HomeNew />;
                }
                
                // For all other cases (including super admin and multiple roles), show HomeNew dashboard
                return <HomeNew />;
              }}
            />
            <Route path="/inventory" component={Inventory} />
            <Route path="/master-inventory" component={MasterInventory} />
            <Route path="/stock-management" component={StockManagement} />
            <Route path="/transactions" component={TransactionLog} />
            <Route path="/users" component={UserManagement} />
            <Route
              path="/weekly-stock-planning"
              component={WeeklyStockPlanning}
            />
            <Route path="/product-catalog" component={ProductCatalog} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      )}
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} duration={3000} />
        ) : (
          <Router />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
