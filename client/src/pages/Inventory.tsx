import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, Edit, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, updateProductSchema, type Product } from "@shared/schema";
import { z } from "zod";

const productFormSchema = insertProductSchema.extend({
  openingStock: z.string().min(1, "Opening stock is required"),
});

const updateFormSchema = updateProductSchema.extend({
  name: z.string().min(1, "Product name is required"),
  unit: z.string().min(1, "Unit is required"),
  openingStock: z.string().min(1, "Opening stock is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;
type UpdateFormData = z.infer<typeof updateFormSchema>;

export default function Inventory() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user has access to inventory management
  const hasAccess = user?.role === 'super_admin' || user?.role === 'master_inventory_handler';

  const { data: products, isLoading: productsLoading, error } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated && hasAccess,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const addForm = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      unit: "",
      openingStock: "",
    },
  });

  const editForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      name: "",
      unit: "",
      openingStock: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await apiRequest("POST", "/api/products", {
        ...data,
        openingStock: data.openingStock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      addForm.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFormData }) => {
      await apiRequest("PUT", `/api/products/${id}`, {
        ...data,
        openingStock: data.openingStock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      editForm.reset();
      setEditingProduct(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      unit: product.unit,
      openingStock: product.openingStock,
    });
  };

  const handleDelete = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  const filteredProducts = products?.filter((product: Product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStockStatus = (currentStock: string) => {
    const stock = parseFloat(currentStock);
    if (stock === 0) return { label: "Out of Stock", color: "destructive" };
    if (stock < 20) return { label: "Low Stock", color: "warning" };
    return { label: "Available", color: "success" };
  };

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

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">
              You don't have permission to access the inventory management system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Master Inventory</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-large">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit((data) => createProductMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measurement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="Litre">Litre</SelectItem>
                          <SelectItem value="Pieces">Pieces</SelectItem>
                          <SelectItem value="Meters">Meters</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="openingStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter opening quantity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Product Name</th>
                    <th className="text-left p-3 font-semibold">Unit</th>
                    <th className="text-left p-3 font-semibold">Opening Stock</th>
                    <th className="text-left p-3 font-semibold">Current Stock</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: Product) => {
                    const status = getStockStatus(product.currentStock);
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{product.name}</td>
                        <td className="p-3">{product.unit}</td>
                        <td className="p-3">{product.openingStock}</td>
                        <td className="p-3">{product.currentStock}</td>
                        <td className="p-3">
                          <Badge variant={status.color as "default" | "secondary" | "destructive" | "outline"}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {product.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (editingProduct) {
                updateProductMutation.mutate({ id: editingProduct.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measurement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="Litre">Litre</SelectItem>
                        <SelectItem value="Pieces">Pieces</SelectItem>
                        <SelectItem value="Meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="openingStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter opening quantity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? "Updating..." : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
