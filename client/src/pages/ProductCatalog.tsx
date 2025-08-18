import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Product } from "@shared/schema";

interface ProductCatalogProps {
  className?: string;
}

export default function ProductCatalog({ className }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; unit: string; currentStock: string; openingStock: string }>({ name: "", unit: "", currentStock: "", openingStock: "" });
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async (updated: { name: string; unit: string; openingStock: string; currentStock: string }) => {
      const res = await fetch(`/api/products/${editProduct?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditProduct(null);
    },
  });

  // Filter and sort products based on search and filters with priority
  const filteredProducts = (products || []).filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = unitFilter === "all" || product.unit === unitFilter;
    
    let matchesStock = true;
    if (stockFilter === "in-stock") {
      matchesStock = parseFloat(product.currentStock) > 10;
    } else if (stockFilter === "low-stock") {
      matchesStock = parseFloat(product.currentStock) <= 10 && parseFloat(product.currentStock) > 0;
    } else if (stockFilter === "out-of-stock") {
      matchesStock = parseFloat(product.currentStock) === 0;
    }
    
    return matchesSearch && matchesUnit && matchesStock;
  }).sort((a: Product, b: Product) => {
    if (!searchQuery) return a.name.localeCompare(b.name);
    
    const queryLower = searchQuery.toLowerCase();
    const aNameLower = a.name.toLowerCase();
    const bNameLower = b.name.toLowerCase();
    
    // Priority 1: Names that start with the search query
    const aStartsWith = aNameLower.startsWith(queryLower);
    const bStartsWith = bNameLower.startsWith(queryLower);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // If both start with query or neither starts with query, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  // Get unique units for filter dropdown, filtering out empty values
  const availableUnits = Array.from(new Set((products || []).map((p: Product) => p.unit).filter((unit: string) => unit && unit.trim() !== '')));

  // Get stock status for a product
  const getStockStatus = (stock: string) => {
    const stockNum = parseFloat(stock);
    if (stockNum === 0) return { status: "out-of-stock", label: "Out of Stock", color: "bg-red-500" };
    if (stockNum <= 10) return { status: "low-stock", label: "Low Stock", color: "bg-yellow-500" };
    return { status: "in-stock", label: "In Stock", color: "bg-green-500" };
  };

  // Format stock display to remove unnecessary decimals
  const formatStock = (stock: string) => {
    const num = parseFloat(stock);
    return num % 1 === 0 ? num.toString() : num.toFixed(3).replace(/\.?0+$/, '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load products</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          {/* Back Button - Enhanced Visibility */}
          <div className="mb-6 sm:mb-8">
            <Link href="/master-inventory">
              <button className="group flex items-center gap-3 px-6 py-3 bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm sm:text-base min-h-[48px] w-full sm:w-auto justify-center sm:justify-start">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Master Inventory</span>
              </button>
            </Link>
          </div>
          
          {/* Title Section */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Product Catalog
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-2 sm:px-0 max-w-2xl">
              Browse and search all <span className="font-semibold text-blue-600">{products?.length || 0}</span> products in your inventory system
            </p>
          </div>
        </div>

        {/* Search and Filter Controls - Enhanced Card Design */}
        <Card className="mb-6 sm:mb-8 bg-white shadow-lg border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by product name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[48px] bg-white transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Filter by Unit</Label>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="min-h-[48px] border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Filter by Stock Level</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="min-h-[48px] border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || unitFilter !== "all" || stockFilter !== "all") && (
              <div className="flex justify-center pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setUnitFilter("all");
                    setStockFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {filteredProducts.length} of {products?.length || 0} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product: Product) => {
              const stockStatus = getStockStatus(product.currentStock);
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg sm:text-xl text-gray-900 mb-2">
                        {product.name}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`${stockStatus.color} text-white text-xs`}
                      >
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Stock:</span>
                        <span className="font-medium">
                          {formatStock(product.currentStock)} {product.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Opening Stock:</span>
                        <span className="text-sm text-gray-500">
                          {formatStock(product.openingStock)} {product.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Unit:</span>
                        <Badge variant="outline" className="text-xs">
                          {product.unit}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge 
                          variant={product.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditProduct(product);
                            setEditForm({
                              name: product.name,
                              unit: product.unit,
                              currentStock: product.currentStock,
                              openingStock: product.openingStock,
                            });
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              />
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                value={editForm.unit}
                onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}
              />
              <Label htmlFor="edit-currentStock">Current Stock</Label>
              <Input
                id="edit-currentStock"
                type="number"
                value={editForm.currentStock}
                onChange={e => setEditForm(f => ({ ...f, currentStock: e.target.value }))}
              />
              <Label htmlFor="edit-openingStock">Opening Stock</Label>
              <Input
                id="edit-openingStock"
                type="number"
                value={editForm.openingStock}
                onChange={e => setEditForm(f => ({ ...f, openingStock: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (editProduct) {
                    updateProductMutation.mutate({
                      name: editForm.name,
                      unit: editForm.unit,
                      openingStock: editForm.openingStock,
                      currentStock: editForm.currentStock, // <-- Add this line
                    });
                  }
                }}
                disabled={updateProductMutation.isPending}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditProduct(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
