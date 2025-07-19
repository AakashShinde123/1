import { ReactNode } from "react";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = "/";
    }
  };

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
      case 'attendance_checker':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '👑 Super Admin';
      case 'master_inventory_handler':
        return '🧑‍🔧 Master Inventory Handler';
      case 'stock_in_manager':
        return '📥 Stock In Manager';
      case 'stock_out_manager':
        return '📤 Stock Out Manager';
      case 'attendance_checker':
        return '📅 Attendance Checker';
      default:
        return role;
    }
  };



  return (
    <div className="min-h-screen app-container webview-optimized bg-white">
      {/* Clean Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <img 
                  src="/assets/111_1750417572953.png" 
                  alt="Sudhamrit Logo" 
                  className="h-7 sm:h-8 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {/* Sudhamrit */}
                  </h1>
                  {/* <p className="text-xs text-gray-500">Inventory Management</p> */}
                </div>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && (
                <>
                  <div className="block">
                    <Badge className={`${getRoleBadgeColor((user as User)?.role || '')} border-0 text-xs px-2 py-1`}>
                      {getRoleDisplayName((user as User)?.role || '')}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {(user as User)?.firstName || (user as User)?.username || (user as User)?.email || 'User'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[44px] min-w-[44px] no-zoom"
                  >
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="safe-area-bottom mobile-full-width">
        <div className="webview-optimized">
          {children}
        </div>
      </div>
    </div>
  );
}
