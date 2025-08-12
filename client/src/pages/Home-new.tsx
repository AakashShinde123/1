import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AlertDashboard from "@/components/AlertDashboard";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  List,
  BarChart3,
  Plus,
  ArrowUp,
  ArrowDown,
  Calendar,
  CalendarCheck,
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  todayStockIn: number;
  todayStockOut: number;
  activeProducts: number;
  lowStockProducts: number;
}

export default function HomeNew() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled:
      isAuthenticated && showDashboard && (user as any)?.role === "super_admin",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img
            src="/assets/111_1750417572953.png"
            alt="Sudhamrit Logo"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sudhamrit</h1>
          <h2 className="text-xl text-gray-600 mb-6">
            Inventory Management System
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600">Please log in to access the system.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get user's active roles (support both single role and multiple roles)
  const userRoles =
    (user as any)?.roles || [(user as any)?.role].filter(Boolean);
  const hasRole = (role: string) => userRoles.includes(role);

  // For users with no roles - show only default buttons (Sudhastar and Holy Creation)
  const hasAnyRoles = userRoles.length > 0;

  const isSuperAdmin = hasRole("super_admin");
  const isMasterInventoryHandler = hasRole("master_inventory_handler");
  const isStockInManager = hasRole("stock_in_manager");
  const isStockOutManager = hasRole("stock_out_manager");
  const isAttendanceChecker = hasRole("attendance_checker");

  // Show dashboard stats if Super Admin user clicked Dashboard button
  if (isSuperAdmin && showDashboard) {
    if (statsLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">Overview of your inventory system</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDashboard(false)}
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              Back to Menu
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active inventory items
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Stock
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalStock || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total units in stock
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today Stock In
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.todayStockIn || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Units added today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today Stock Out
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.todayStockOut || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Units removed today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts Section */}
          <div className="mt-8">
            <AlertDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Role-specific dashboard - Super Admin gets all cards, others get role-specific cards
  const availableActions = [];

  // Dashboard access - only for Super Admin role
  if (hasRole("super_admin")) {
    availableActions.push({
      key: "dashboard",
      component: (
        <div
          key="dashboard"
          className="sketch-card sketch-card-purple p-4 cursor-pointer h-32"
          onClick={() => setShowDashboard(true)}
        >
          <div className="text-center h-full flex flex-col justify-center">
            <div className="mx-auto w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 shadow-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base font-medium text-purple-800 mb-1">
              Dashboard
            </h3>
            <p className="text-purple-600 text-xs">View statistics</p>
          </div>
        </div>
      ),
    });
  }

  // Master Inventory access - for Master Inventory Handler role OR Super Admin
  if (hasRole("master_inventory_handler") || hasRole("super_admin")) {
    availableActions.push({
      key: "master-inventory",
      component: (
        <Link key="master-inventory" href="/master-inventory">
          <div className="sketch-card sketch-card-blue p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-blue-800 mb-1">
                Master Inventory
              </h3>
              <p className="text-blue-600 text-xs">Manage products</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Stock In access - for Stock In Manager role OR Super Admin
  if (hasRole("stock_in_manager") || hasRole("super_admin")) {
    availableActions.push({
      key: "stock-in",
      component: (
        <Link key="stock-in" href="/stock-management?tab=stock-in">
          <div className="sketch-card sketch-card-green p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <ArrowUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-green-800 mb-1">
                Stock In
              </h3>
              <p className="text-green-600 text-xs">Add inventory</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Stock Out access - for Stock Out Manager role OR Super Admin
  if (hasRole("stock_out_manager") || hasRole("super_admin")) {
    availableActions.push({
      key: "stock-out",
      component: (
        <Link key="stock-out" href="/stock-management?tab=stock-out">
          <div className="sketch-card sketch-card-red p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <ArrowDown className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-red-800 mb-1">
                Stock Out
              </h3>
              <p className="text-red-600 text-xs">Remove inventory</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Transaction Log access - only for Super Admin role
  if (hasRole("super_admin")) {
    availableActions.push({
      key: "transactions",
      component: (
        <Link key="transactions" href="/transactions">
          <div className="sketch-card sketch-card-yellow p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <List className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-yellow-800 mb-1">
                Transaction Log
              </h3>
              <p className="text-yellow-600 text-xs">View transactions</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // User Management access - only for Super Admin role
  if (hasRole("super_admin")) {
    availableActions.push({
      key: "users",
      component: (
        <Link key="users" href="/users">
          <div className="sketch-card sketch-card-red p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-rose-800 mb-1">
                User Management
              </h3>
              <p className="text-rose-600 text-xs">Manage users</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Attendance Portal access - for Attendance Checker role OR Super Admin
  if (hasRole("attendance_checker") || hasRole("super_admin")) {
    availableActions.push({
      key: "attendance",
      component: (
        <a
          key="attendance"
          href="https://attandace.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="sketch-card sketch-card-indigo p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <CalendarCheck className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-indigo-800 mb-1">
                Attendance Portal
              </h3>
              <p className="text-indigo-600 text-xs">Track attendance</p>
            </div>
          </div>
        </a>
      ),
    });
  }

  // Weekly Planner access - for Weekly Planner role OR Super Admin
  if (hasRole("weekly_stock_planner") || hasRole("super_admin")) {
    // <-- fix here
    availableActions.push({
      key: "weekly-planner",
      component: (
        <Link key="weekly-planner" href="/weekly-stock-planning">
          <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200 p-4 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-teal-800 mb-1 text-bold text-capitalize">
                Weekly Planner
              </h3>
              <p className="text-teal-600 text-xs">View & plan weekly tasks</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // All Reports Generate access
  if (hasRole("all_reports") || hasRole("super_admin")) {
    availableActions.push({
      key: "all-reports",
      component: (
        <Link key="all-reports" href="/reports">
          <div className="sketch-card sketch-card-orange p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-orange-800 mb-1">
                All Reports
              </h3>
              <p className="text-orange-600 text-xs">
                Generate & download all reports
              </p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Orders button
  if (hasRole("orders") || hasRole("super_admin")) {
    availableActions.push({
      key: "orders",
      component: (
        <Link key="orders" href="/order-details">
          <div className="sketch-card sketch-card-lime p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <List className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-lime-800 mb-1">
                Orders
              </h3>
              <p className="text-lime-600 text-xs">View and manage orders</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // "Send Message" access
  if (hasRole("send_message") || hasRole("super_admin")) {
    availableActions.push({
      key: "send-message",
      component: (
        <Link key="send-message" href="/send-message">
          <div className="sketch-card sketch-card-cyan p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-cyan-800 mb-1">
                Send Message
              </h3>
              <p className="text-cyan-600 text-xs">
                Send a message to users/admin
              </p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Check if user has any assigned roles (not empty roles array)
  const hasAnyAssignedRoles = userRoles.length > 0;

  // For users with NO assigned roles (pending approval), show only default buttons
  if (!hasAnyAssignedRoles) {
    // Sudhastar button - for users awaiting role assignment
    availableActions.push({
      key: "sudhastar",
      component: (
        <a
          key="sudhastar"
          href="https://mysudhamrit.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="sketch-card sketch-card-pink p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-pink-800 mb-1">
                Sudhastar
              </h3>
              <p className="text-pink-600 text-xs">Sudhastar section</p>
            </div>
          </div>
        </a>
      ),
    });

    // Holy Creation button - for users awaiting role assignment
    availableActions.push({
      key: "holy-creation",
      component: (
        <Link key="holy-creation" href="/holy-creation">
          <div className="sketch-card sketch-card-indigo p-4 cursor-pointer h-32">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-indigo-800 mb-1">
                Holy Creation
              </h3>
              <p className="text-indigo-600 text-xs">Holy Creation section</p>
            </div>
          </div>
        </Link>
      ),
    });
  }

  // Create dynamic title based on roles
  const roleNames = [];
  if (isSuperAdmin) roleNames.push("Super Admin");
  if (isMasterInventoryHandler) roleNames.push("Master Inventory Handler");
  if (isStockInManager) roleNames.push("Stock In Manager");
  if (isStockOutManager) roleNames.push("Stock Out Manager");
  if (isAttendanceChecker) roleNames.push("Attendance Checker");

  // Only show multi-role dashboard if user has at least one available action
  if (availableActions.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 paper-texture">
        {/* Simple Header */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              {roleNames.length > 1
                ? `${roleNames.join(", ")} Dashboard`
                : roleNames.length === 1
                ? `${roleNames[0]} Dashboard`
                : "Welcome to Sudhamrit Inventory Management"}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {availableActions.map((action) => action.component)}
          </div>
        </div>
      </div>
    );
  }

  // If user has no roles or unrecognized configuration, show a fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <img
          src="/assets/111_1750417572953.png"
          alt="Sudhamrit Logo"
          className="h-16 w-auto mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Access Restricted
        </h1>
        <p className="text-gray-600 mb-6">
          Your account doesn't have any assigned roles.
        </p>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">
            Please contact your system administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}
