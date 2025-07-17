
import { Button } from "@/components/ui/button";
import { Package, Calendar, ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function MasterInventory() {
  const { user } = useAuth();
  
  // Debug: Log the current user and their role
  console.log("MasterInventory page - Current user:", user);
  console.log("MasterInventory page - User role:", (user as any)?.role);
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back to Home Button - Mobile Optimized */}
        <div className="mb-8 sm:mb-6">
          <Link href="/">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 min-h-[44px] no-zoom"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">Back to Home</span>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Master Inventory Selection
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-2">
            Manage products, plan weekly stock, or browse catalog
          </p>
          <p className="text-xs sm:text-sm text-green-600 mt-2 font-medium">
            ✓ You are on the Master Inventory page - Role: {(user as any)?.role}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {/* Manage Products */}
          <Link href="/inventory?direct=true">
            <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer h-32">
              <div className="text-center h-full flex flex-col justify-center">
                <div className="mx-auto w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-medium text-blue-800 mb-1">Manage Products</h3>
                <p className="text-blue-600 text-xs">
                  Create products
                </p>
              </div>
            </div>
          </Link>

          {/* Plan Weekly Stock */}
          <Link href="/weekly-stock-planning">
            <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer h-32">
              <div className="text-center h-full flex flex-col justify-center">
                <div className="mx-auto w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-medium text-green-800 mb-1">Plan Weekly Stock</h3>
                <p className="text-green-600 text-xs">
                  Set weekly plans
                </p>
              </div>
            </div>
          </Link>

          {/* Product Catalog */}
          <Link href="/product-catalog">
            <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer h-32">
              <div className="text-center h-full flex flex-col justify-center">
                <div className="mx-auto w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-medium text-purple-800 mb-1">Product Catalog</h3>
                <p className="text-purple-600 text-xs">
                  Browse catalog
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
