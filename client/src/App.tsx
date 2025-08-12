import React, { useState } from "react";
import { Switch, Route } from "wouter";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import HomeNew from "@/pages/Home-new";
import Inventory from "@/pages/Inventory";
import MasterInventory from "@/pages/MasterInventory";
import StockManagement from "@/pages/StockManagement";
import TransactionLog from "@/pages/TransactionLog";
import UserManagement from "@/pages/UserManagement";
import WeeklyStockPlanning from "@/pages/WeeklyStockPlanning";
import ProductCatalog from "@/pages/ProductCatalog";
import Reports from "@/pages/Reports";
import OrderDetails from "@/pages/OrderDetails";

import Layout from "@/components/Layout";
import SplashScreen from "@/components/SplashScreen";
import OrderReport from "@/pages/OrderReport";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  console.log("Router Debug:", { isAuthenticated, isLoading, user });

  if (isLoading) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering routes, isAuthenticated:", isAuthenticated);
  
  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/" component={Login} />
        </>
      ) : (
        <Layout>
          <Switch>
            <Route
              path="/"
              component={() => {
                // Get user's active roles (support both single role and multiple roles)
                const userRoles = (user as any)?.roles || [(user as any)?.role].filter(Boolean);
                const hasRole = (role: string) => userRoles.includes(role);
                
                // Handle users with no roles (awaiting approval)
                if (!userRoles.length || userRoles.length === 0) {
                  return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
                        <p className="text-gray-600 mb-6">
                          Your account has been created successfully! Please wait for an administrator to assign your role and activate your account.
                        </p>
                        <button
                          onClick={() => {
                            fetch('/api/logout', { method: 'POST' })
                              .then(() => {
                                window.location.href = '/login';
                              });
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Return to Login
                        </button>
                      </div>
                    </div>
                  );
                }
                
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
            <Route path="/product-catalog" component={() => <ProductCatalog />} />
            <Route path="/reports" component={Reports} />
            <Route path="/order-details" component={OrderDetails} />
            <Route path="/order-report" component={OrderReport} />
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
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
