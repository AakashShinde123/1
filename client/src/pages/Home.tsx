import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Package, 
  Warehouse, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  List,
  Users,
  FileText
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }

    // Redirect users with specific roles directly to their forms
    if (isAuthenticated && user) {
      const userRole = (user as any)?.role;
      if (userRole === 'stock_in_manager' || userRole === 'stock_out_manager') {
        setLocation('/stock-management');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  // Only Super Admin and Master Inventory Handler can access dashboard
  const canAccessDashboard = (user as any)?.role === 'super_admin' || (user as any)?.role === 'master_inventory_handler';

  const { data: stats, isLoading: statsLoading, error } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated && canAccessDashboard,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'master_inventory_handler':
        return 'bg-blue-100 text-blue-800';
      case 'stock_in_manager':
        return 'bg-green-100 text-green-800';
      case 'stock_out_manager':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '👑 Super Admin';
      case 'master_inventory_handler':
        return '🧑‍🔧 Master Inventory Handler';
      case 'stock_in_manager':
        return '📥 Stock In Manager';
      case 'stock_out_manager':
        return '📤 Stock Out Manager';
      default:
        return role;
    }
  };

  const getQuickActions = () => {
    const actions = [];

    switch ((user as any)?.role) {
      case 'super_admin':
        actions.push(
          { label: 'Master Inventory', icon: Package, href: '/inventory', color: 'primary' },
          { label: 'Stock Management', icon: TrendingUp, href: '/stock-management', color: 'success' },
          { label: 'User Management', icon: Users, href: '/users', color: 'secondary' }
        );
        break;
      case 'master_inventory_handler':
        actions.push(
          { label: 'Master Inventory', icon: Package, href: '/inventory', color: 'primary' },
          { label: 'Transaction Log', icon: List, href: '/transactions', color: 'info' },
          { label: 'Reports', icon: FileText, href: '#', color: 'secondary' }
        );
        break;
      case 'stock_in_manager':
        actions.push(
          { label: 'Stock Management', icon: TrendingUp, href: '/stock-management', color: 'success' },
          { label: 'My Transactions', icon: List, href: '/transactions', color: 'info' }
        );
        break;
      case 'stock_out_manager':
        actions.push(
          { label: 'Stock Management', icon: TrendingDown, href: '/stock-management', color: 'warning' },
          { label: 'My Transactions', icon: List, href: '/transactions', color: 'info' }
        );
        break;
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg shadow-lg border border-purple-200 p-6" style={{backgroundColor: '#F5F0F6'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-purple-900">
              Welcome, {(user as any)?.firstName || (user as any)?.email}!
            </h1>
            <div className="mt-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor((user as any)?.role)}`}>
                {getRoleName((user as any)?.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card border-purple-200" style={{backgroundColor: '#F5F0F6'}}>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-purple-700">{(stats as any)?.totalProducts || 0}</h3>
            )}
            <p className="text-purple-600 font-medium">Total Products</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-purple-200" style={{backgroundColor: '#F5F0F6'}}>
          <CardContent className="p-6 text-center">
            <Warehouse className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-emerald-700">{(stats as any)?.totalStock || 0}</h3>
            )}
            <p className="text-emerald-600 font-medium">Current Stock</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-purple-200" style={{backgroundColor: '#F5F0F6'}}>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-blue-700">{(stats as any)?.todayStockIn || 0}</h3>
            )}
            <p className="text-blue-600 font-medium">Today's Stock In</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-purple-200" style={{backgroundColor: '#F5F0F6'}}>
          <CardContent className="p-6 text-center">
            <TrendingDown className="h-12 w-12 text-amber-600 mx-auto mb-3" />
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-amber-700">{(stats as any)?.todayStockOut || 0}</h3>
            )}
            <p className="text-amber-600 font-medium">Today's Stock Out</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-purple-200" style={{backgroundColor: '#F5F0F6'}}>
        <CardHeader className="border-b border-purple-200" style={{backgroundColor: '#F5F0F6'}}>
          <CardTitle className="flex items-center text-purple-800">
            <Plus className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getQuickActions().map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col btn-large hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border-purple-300 hover:border-purple-400"
                  style={{'--hover-bg': '#F5F0F6'} as any}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F0F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <action.icon className="h-8 w-8 mb-2 text-purple-600" />
                  <span className="text-purple-700 font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
