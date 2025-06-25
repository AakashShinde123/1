import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, RotateCcw, AlertTriangle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProductSearch from "@/components/ProductSearch";
import ConfirmationDialog, { type TransactionData } from "@/components/ConfirmationDialog";
import type { Product } from "@shared/schema";

const stockInFormSchema = z.object({
  remarks: z.string().optional(),
  poNumber: z.string().optional(),
});

const stockOutFormSchema = z.object({
  remarks: z.string().optional(),
  soNumber: z.string().optional(),
});

type StockInFormData = z.infer<typeof stockInFormSchema>;
type StockOutFormData = z.infer<typeof stockOutFormSchema>;

interface ProductItem {
  product: Product;
  quantity: string;
  quantityOut?: string;
  currentStock: string;
  newStock: string;
}

type TransactionPreview = TransactionData;

export default function StockManagement() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [selectedProductsIn, setSelectedProductsIn] = useState<Array<{product: Product, quantity: string}>>([]);
  const [selectedProductsOut, setSelectedProductsOut] = useState<Array<{product: Product, quantityOut: string}>>([]);
  const [transactionPreview, setTransactionPreview] = useState<TransactionPreview | null>(null);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

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
  }, [isAuthenticated, isLoading, toast]);

  const canStockIn = (user as any)?.role === 'super_admin' || (user as any)?.role === 'stock_in_manager' || (user as any)?.role === 'master_inventory_handler';
  const canStockOut = (user as any)?.role === 'super_admin' || (user as any)?.role === 'stock_out_manager' || (user as any)?.role === 'master_inventory_handler';
  
  const showStockInOnly = (user as any)?.role === 'stock_in_manager';
  const showStockOutOnly = (user as any)?.role === 'stock_out_manager';

  const stockInForm = useForm<StockInFormData>({
    resolver: zodResolver(stockInFormSchema),
    defaultValues: {
      remarks: "",
      poNumber: "",
    },
  });

  const stockOutForm = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutFormSchema),
    defaultValues: {
      remarks: "",
      soNumber: "",
    },
  });

  // Product management functions
  const addProductIn = (product: Product) => {
    const existingIndex = selectedProductsIn.findIndex(item => item.product.id === product.id);
    if (existingIndex === -1) {
      setSelectedProductsIn([...selectedProductsIn, { product, quantity: "" }]);
    }
  };

  const addProductOut = (product: Product) => {
    const existingIndex = selectedProductsOut.findIndex(item => item.product.id === product.id);
    if (existingIndex === -1) {
      setSelectedProductsOut([...selectedProductsOut, { product, quantityOut: "" }]);
    }
  };

  const removeProductIn = (productId: number) => {
    setSelectedProductsIn(selectedProductsIn.filter(item => item.product.id !== productId));
  };

  const removeProductOut = (productId: number) => {
    setSelectedProductsOut(selectedProductsOut.filter(item => item.product.id !== productId));
    setStockWarnings(stockWarnings.filter(w => !w.includes(selectedProductsOut.find(p => p.product.id === productId)?.product.name || "")));
  };

  const updateQuantityIn = (productId: number, quantity: string) => {
    setSelectedProductsIn(selectedProductsIn.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const updateQuantityOut = (productId: number, quantityOut: string) => {
    setSelectedProductsOut(selectedProductsOut.map(item => 
      item.product.id === productId ? { ...item, quantityOut } : item
    ));
    
    const product = selectedProductsOut.find(item => item.product.id === productId);
    if (product && quantityOut) {
      const currentStock = parseFloat(product.product.currentStock);
      const requestedQuantity = parseFloat(quantityOut);
      
      if (requestedQuantity > currentStock) {
        const newWarnings = stockWarnings.filter(w => !w.includes(product.product.name));
        newWarnings.push(`${product.product.name}: Requested ${requestedQuantity} exceeds available ${currentStock}`);
        setStockWarnings(newWarnings);
      } else {
        setStockWarnings(stockWarnings.filter(w => !w.includes(product.product.name)));
      }
    }
  };

  // Mutations
  const stockInMutation = useMutation({
    mutationFn: async (transactions: Array<{productId: number, quantity: string, remarks?: string, poNumber?: string}>) => {
      const results = [];
      for (const transaction of transactions) {
        const response = await apiRequest('POST', '/api/transactions/stock-in', transaction);
        results.push(response);
      }
      return results;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock in transactions recorded successfully",
      });
      setTransactionPreview(null);
      handleResetIn();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record stock in transactions",
        variant: "destructive",
      });
    },
  });

  const stockOutMutation = useMutation({
    mutationFn: async (transactions: Array<{productId: number, quantityOut: string, remarks?: string, soNumber?: string}>) => {
      const results = [];
      for (const transaction of transactions) {
        const response = await apiRequest('POST', '/api/transactions/stock-out', transaction);
        results.push(response);
      }
      return results;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock out transactions recorded successfully",
      });
      setTransactionPreview(null);
      handleResetOut();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record stock out transactions",
        variant: "destructive",
      });
    },
  });

  // Preview handlers
  const handlePreviewIn = (data: StockInFormData) => {
    if (selectedProductsIn.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive",
      });
      return;
    }

    const productItems: ProductItem[] = selectedProductsIn
      .filter(item => item.quantity && parseFloat(item.quantity) > 0)
      .map(item => {
        const currentStock = parseFloat(item.product.currentStock);
        const quantity = parseFloat(item.quantity);
        const newStock = currentStock + quantity;

        return {
          product: item.product,
          quantity: item.quantity,
          currentStock: item.product.currentStock,
          newStock: newStock.toString(),
        };
      });

    if (productItems.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid quantities for all selected products",
        variant: "destructive",
      });
      return;
    }

    setTransactionPreview({
      products: productItems.map(item => ({
        product: item.product.name,
        unit: item.product.unit,
        currentStock: item.currentStock,
        quantity: item.quantity,
        newStock: item.newStock,
      })),
      remarks: data.remarks,
      date: new Date().toLocaleDateString(),
      poNumber: data.poNumber,
      type: 'Stock In',
    });
  };

  const handlePreviewOut = (data: StockOutFormData) => {
    if (selectedProductsOut.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive",
      });
      return;
    }

    const productItems: ProductItem[] = [];
    const warnings: string[] = [];

    for (const item of selectedProductsOut) {
      if (!item.quantityOut || parseFloat(item.quantityOut) <= 0) continue;

      const currentStock = parseFloat(item.product.currentStock);
      const quantity = parseFloat(item.quantityOut);
      
      if (quantity > currentStock) {
        warnings.push(`${item.product.name}: Requested ${quantity} exceeds available ${currentStock}`);
        continue;
      }

      const newStock = currentStock - quantity;
      productItems.push({
        product: item.product,
        quantity: item.quantityOut,
        quantityOut: item.quantityOut,
        currentStock: item.product.currentStock,
        newStock: newStock.toString(),
      });
    }

    if (warnings.length > 0) {
      setStockWarnings(warnings);
      toast({
        title: "Stock Validation Error",
        description: warnings.join("; "),
        variant: "destructive",
      });
      return;
    }

    if (productItems.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid quantities for all selected products",
        variant: "destructive",
      });
      return;
    }

    setTransactionPreview({
      products: productItems.map(item => ({
        product: item.product.name,
        unit: item.product.unit,
        currentStock: item.currentStock,
        quantity: item.quantityOut || item.quantity,
        newStock: item.newStock,
      })),
      remarks: data.remarks,
      date: new Date().toLocaleDateString(),
      soNumber: data.soNumber,
      type: 'Stock Out',
    });
  };

  const handleConfirm = () => {
    if (!transactionPreview) return;
    
    if (transactionPreview.type === 'Stock In') {
      const transactions = selectedProductsIn.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        remarks: transactionPreview.remarks,
        poNumber: transactionPreview.poNumber,
      }));
      stockInMutation.mutate(transactions);
    } else {
      const transactions = selectedProductsOut.map(item => ({
        productId: item.product.id,
        quantityOut: item.quantityOut!,
        remarks: transactionPreview.remarks,
        soNumber: transactionPreview.soNumber,
      }));
      stockOutMutation.mutate(transactions);
    }
  };

  const handleResetIn = () => {
    stockInForm.reset({
      remarks: "",
      poNumber: "",
    });
    setSelectedProductsIn([]);
  };

  const handleResetOut = () => {
    stockOutForm.reset({
      remarks: "",
      soNumber: "",
    });
    setSelectedProductsOut([]);
    setStockWarnings([]);
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

  if (!canStockIn && !canStockOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access stock management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {showStockInOnly ? 'Stock In Management' : showStockOutOnly ? 'Stock Out Management' : 'Stock Management'}
        </h1>
        <p className="text-gray-600 mt-2">
          {showStockInOnly ? 'Add multiple products to your stock' : showStockOutOnly ? 'Remove multiple products from your stock' : 'Manage your inventory stock levels'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {showStockInOnly ? (
          <StockInForm />
        ) : showStockOutOnly ? (
          <StockOutForm />
        ) : canStockIn && canStockOut ? (
          <Tabs defaultValue="stock-in" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock-in" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Stock In
              </TabsTrigger>
              <TabsTrigger value="stock-out" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Stock Out
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stock-in">
              <StockInForm />
            </TabsContent>

            <TabsContent value="stock-out">
              <StockOutForm />
            </TabsContent>
          </Tabs>
        ) : canStockIn ? (
          <StockInForm />
        ) : (
          <StockOutForm />
        )}

        {transactionPreview && (
          <ConfirmationDialog
            isOpen={!!transactionPreview}
            onClose={() => setTransactionPreview(null)}
            onConfirm={handleConfirm}
            onEdit={() => setTransactionPreview(null)}
            title={`Confirm ${transactionPreview.type} Transactions`}
            transactionData={transactionPreview}
            isLoading={stockInMutation.isPending || stockOutMutation.isPending}
          />
        )}
      </div>
    </div>
  );

  function StockInForm() {
    return (
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Stock In - Multiple Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...stockInForm}>
            <form onSubmit={stockInForm.handleSubmit(handlePreviewIn)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search & Add Products
                </label>
                <ProductSearch
                  onProductSelect={addProductIn}
                  placeholder="Type to search and add products..."
                />
                
                {selectedProductsIn.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-gray-900">Selected Products ({selectedProductsIn.length}):</h4>
                    {selectedProductsIn.map((item) => (
                      <div key={item.product.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-green-900">{item.product.name}</h5>
                            <p className="text-green-700">Current Stock: {item.product.currentStock} {item.product.unit}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductIn(item.product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity to Add
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Enter quantity..."
                            value={item.quantity}
                            onChange={(e) => updateQuantityIn(item.product.id, e.target.value)}
                            className="text-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                <FormField
                control={stockInForm.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="STW-001"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value && !value.startsWith('STW-')) {
                            field.onChange('STW-' + value.replace(/[^0-9]/g, ''));
                          } else {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockInForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any remarks..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              

              <div className="flex justify-center space-x-4">
                <Button
                  type="submit"
                  className="btn-large bg-green-600 hover:bg-green-700"
                  disabled={selectedProductsIn.length === 0}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Preview Transactions
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-large"
                  onClick={handleResetIn}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  function StockOutForm() {
    return (
      <Card>
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TrendingDown className="h-5 w-5" />
            Stock Out - Multiple Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...stockOutForm}>
            <form onSubmit={stockOutForm.handleSubmit(handlePreviewOut)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search & Add Products
                </label>
                <ProductSearch
                  onProductSelect={addProductOut}
                  placeholder="Type to search and add products..."
                />
                
                {selectedProductsOut.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-gray-900">Selected Products ({selectedProductsOut.length}):</h4>
                    {selectedProductsOut.map((item) => (
                      <div key={item.product.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-orange-900">{item.product.name}</h5>
                            <p className="text-orange-700">Available Stock: {item.product.currentStock} {item.product.unit}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductOut(item.product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity Out
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Enter quantity out..."
                            value={item.quantityOut}
                            onChange={(e) => updateQuantityOut(item.product.id, e.target.value)}
                            className="text-lg"
                          />
                          {stockWarnings.some(w => w.includes(item.product.name)) && (
                            <p className="text-red-600 text-sm mt-1">
                              {stockWarnings.find(w => w.includes(item.product.name))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {stockWarnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {stockWarnings.join("; ")}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={stockOutForm.control}
                name="soNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SO Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="STW-001"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value && !value.startsWith('STW-')) {
                            field.onChange('STW-' + value.replace(/[^0-9]/g, ''));
                          } else {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stockOutForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any remarks..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <div className="flex justify-center space-x-4">
                <Button
                  type="submit"
                  className="btn-large bg-orange-600 hover:bg-orange-700"
                  disabled={selectedProductsOut.length === 0 || stockWarnings.length > 0}
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Preview Transactions
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-large"
                  onClick={handleResetOut}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
}
