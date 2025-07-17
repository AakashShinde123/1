
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
            <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background rounded-lg border p-4 hover:bg-accent hover:shadow-md transition-all cursor-pointer">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-base font-medium">Manage Products</h3>
                <p className="text-gray-600 text-xs mt-1">
                  Create products
                </p>
              </div>
            </div>
          </Link>

          {/* Plan Weekly Stock */}
          <Link href="/weekly-stock-planning">
            <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background rounded-lg border p-4 hover:bg-accent hover:shadow-md transition-all cursor-pointer">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-base font-medium">Plan Weekly Stock</h3>
                <p className="text-gray-600 text-xs mt-1">
                  Set weekly plans
                </p>
              </div>
            </div>
          </Link>

          {/* Product Catalog */}
          <Link href="/product-catalog">
            <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background rounded-lg border p-4 hover:bg-accent hover:shadow-md transition-all cursor-pointer">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Search className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-base font-medium">Product Catalog</h3>
                <p className="text-gray-600 text-xs mt-1">
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
