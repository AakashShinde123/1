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
    <div className="min-h-screen" style={{backgroundColor: '#F5F0F6'}}>
      {/* Navigation Bar */}
      <nav className="text-purple-900 shadow-lg" style={{backgroundColor: '#F5F0F6', borderBottom: '1px solid #E2D5F3'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer rounded-lg p-2" style={{backgroundColor: '#F5F0F6'}}>
                <img 
                  src="/assets/111_1750417572953.png" 
                  alt="Sudhamrit Logo" 
                  className="h-8 w-auto"
                />
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Badge className={`${getRoleBadgeColor((user as User)?.role || '')} border-0`}>
                    {getRoleDisplayName((user as User)?.role || '')}
                  </Badge>
                  <span className="text-sm">
                    {(user as User)?.firstName || (user as User)?.username || (user as User)?.email || 'User'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-purple-700 border-purple-300 hover:bg-purple-100 hover:text-purple-900"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Full width for all users */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
