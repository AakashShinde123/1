import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  AlertTriangle,
  X,
  Plus,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProductSearch from "@/components/ProductSearch";
import ConfirmationDialog, {
  type TransactionData,
} from "@/components/ConfirmationDialog";
import type { Product } from "@shared/schema";
import { Link } from "wouter";

const stockInFormSchema = z.object({
  poNumber: z.string().optional(),
});

const stockOutFormSchema = z.object({
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
  selectedUnit?: string;
}

type TransactionPreview = TransactionData;

export default function StockManagement() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [transactionPreview, setTransactionPreview] =
    useState<TransactionPreview | null>(null);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);
  const [showProductSearchIn, setShowProductSearchIn] = useState(false);
  const [showProductSearchOut, setShowProductSearchOut] = useState(false);

  // State for managing multiple product editing
  const [editingQueue, setEditingQueue] = useState<
    Array<{
      product: Product;
      quantity: string;
      quantityOut?: string;
      selectedUnit: string;
    }>
  >([]);
  const [currentEditIndex, setCurrentEditIndex] = useState(0);
  const [showEditQueue, setShowEditQueue] = useState(false);

  // State for showing dashboard vs functionality
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<
    "stock-in" | "stock-out" | null
  >(null);

  // Current product being worked on
  const [currentProductIn, setCurrentProductIn] = useState<{
    product: Product;
    quantity: string;
    selectedUnit: string;
  } | null>(null);
  const [currentProductOut, setCurrentProductOut] = useState<{
    product: Product;
    quantityOut: string;
    selectedUnit: string;
  } | null>(null);

  // Completed products ready for transaction
  const [completedProductsIn, setCompletedProductsIn] = useState<
    Array<{ product: Product; quantity: string; selectedUnit: string }>
  >([]);
  const [completedProductsOut, setCompletedProductsOut] = useState<
    Array<{ product: Product; quantityOut: string; selectedUnit: string }>
  >([]);

  // Unit conversion utilities
  const getAvailableUnits = (product: Product) => {
    const baseUnit = product.unit.toLowerCase();
    const units = [{ value: product.unit, label: product.unit }];

    if (
      baseUnit === "kg" ||
      baseUnit === "kilogram" ||
      baseUnit === "kilograms"
    ) {
      units.push({ value: "Grams", label: "Grams" });
    }

    if (
      baseUnit === "litre" ||
      baseUnit === "liter" ||
      baseUnit === "litres" ||
      baseUnit === "liters"
    ) {
      units.push({ value: "Millilitre", label: "Millilitre" });
    }

    return units;
  };

  const convertToBaseUnit = (
    quantity: string,
    selectedUnit: string,
    product: Product,
  ) => {
    const baseUnit = product.unit.toLowerCase();
    const qty = parseFloat(quantity);

    if (
      selectedUnit === "Grams" &&
      (baseUnit === "kg" || baseUnit === "kilogram" || baseUnit === "kilograms")
    ) {
      return (qty / 1000).toString();
    }

    if (
      selectedUnit === "Millilitre" &&
      (baseUnit === "litre" ||
        baseUnit === "liter" ||
        baseUnit === "litres" ||
        baseUnit === "liters")
    ) {
      return (qty / 1000).toString();
    }

    return quantity;
  };

  const formatDisplayQuantity = (quantity: string, unit: string) => {
    const qty = parseFloat(quantity);
    if (unit === "Grams") {
      return `${qty} grams`;
    }
    if (unit === "Millilitre") {
      return `${qty} millilitre`;
    }
    return `${qty} ${unit}`;
  };

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

  const isSuperAdmin = (user as any)?.role === "super_admin";
  const canStockIn =
    (user as any)?.role === "super_admin" ||
    (user as any)?.role === "master_inventory_handler" ||
    (user as any)?.role === "stock_in_manager";
  const canStockOut =
    (user as any)?.role === "super_admin" ||
    (user as any)?.role === "master_inventory_handler" ||
    (user as any)?.role === "stock_out_manager";

  const showStockInOnly = (user as any)?.role === "stock_in_manager";
  const showStockOutOnly = (user as any)?.role === "stock_out_manager";

  const stockInForm = useForm<StockInFormData>({
    resolver: zodResolver(stockInFormSchema),
    defaultValues: {
      poNumber: "",
    },
  });

  const stockOutForm = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutFormSchema),
    defaultValues: {
      soNumber: "",
    },
  });

  // Product management functions
  const addProductIn = (product: Product) => {
    if (
      currentProductIn?.product.id === product.id ||
      completedProductsIn.some((item) => item.product.id === product.id)
    ) {
      toast({
        title: "Product already selected",
        description: `${product.name} is already in your list`,
        variant: "destructive",
      });
      return;
    }

    if (
      currentProductIn &&
      currentProductIn.quantity &&
      parseFloat(currentProductIn.quantity) > 0
    ) {
      setCompletedProductsIn((prev) => [...prev, currentProductIn]);
    }

    setCurrentProductIn({
      product,
      quantity: "",
      selectedUnit: product.unit,
    });
  };

  const addProductOut = (product: Product) => {
    if (
      currentProductOut?.product.id === product.id ||
      completedProductsOut.some((item) => item.product.id === product.id)
    ) {
      toast({
        title: "Product already selected",
        description: `${product.name} is already in your list`,
        variant: "destructive",
      });
      return;
    }

    if (
      currentProductOut &&
      currentProductOut.quantityOut &&
      parseFloat(currentProductOut.quantityOut) > 0
    ) {
      setCompletedProductsOut((prev) => [...prev, currentProductOut]);
    }

    setCurrentProductOut({
      product,
      quantityOut: "",
      selectedUnit: product.unit,
    });
  };

  const removeCompletedProductIn = (productId: number) => {
    setCompletedProductsIn(
      completedProductsIn.filter((item) => item.product.id !== productId),
    );
  };

  const removeCompletedProductOut = (productId: number) => {
    setCompletedProductsOut(
      completedProductsOut.filter((item) => item.product.id !== productId),
    );
  };

  // Functions for editing queue navigation
  const goToNextEditProduct = () => {
    if (currentEditIndex < editingQueue.length - 1) {
      setCurrentEditIndex(currentEditIndex + 1);
    }
  };

  const goToPreviousEditProduct = () => {
    if (currentEditIndex > 0) {
      setCurrentEditIndex(currentEditIndex - 1);
    }
  };

  const saveCurrentEdit = () => {
    const currentEdit = editingQueue[currentEditIndex];
    if (!currentEdit) return;

    if (transactionPreview?.type === "Stock In" || currentEdit.quantity) {
      // Save to completed products for stock in
      const updatedProduct = {
        product: currentEdit.product,
        quantity: currentEdit.quantity,
        selectedUnit: currentEdit.selectedUnit,
      };
      setCompletedProductsIn((prev) => [...prev, updatedProduct]);
    } else {
      // Save to completed products for stock out
      const updatedProduct = {
        product: currentEdit.product,
        quantityOut: currentEdit.quantityOut || "",
        selectedUnit: currentEdit.selectedUnit,
      };
      setCompletedProductsOut((prev) => [...prev, updatedProduct]);
    }

    // Remove from queue and go to next
    const newQueue = editingQueue.filter(
      (_, index) => index !== currentEditIndex,
    );
    setEditingQueue(newQueue);

    if (newQueue.length === 0) {
      // All products edited, close the queue
      setShowEditQueue(false);
      setCurrentEditIndex(0);
      toast({
        title: "Editing Complete",
        description: "All selected products have been edited.",
      });
    } else if (currentEditIndex >= newQueue.length) {
      // Adjust index if we were at the end
      setCurrentEditIndex(newQueue.length - 1);
    }
  };

  const skipCurrentEdit = () => {
    const currentEdit = editingQueue[currentEditIndex];
    if (!currentEdit) return;

    // Return product to completed list without changes
    if (transactionPreview?.type === "Stock In" || currentEdit.quantity) {
      setCompletedProductsIn((prev) => [...prev, currentEdit]);
    } else {
      const productWithQuantityOut = {
        product: currentEdit.product,
        quantityOut: currentEdit.quantityOut || "",
        selectedUnit: currentEdit.selectedUnit,
      };
      setCompletedProductsOut((prev) => [...prev, productWithQuantityOut]);
    }

    // Remove from queue
    const newQueue = editingQueue.filter(
      (_, index) => index !== currentEditIndex,
    );
    setEditingQueue(newQueue);

    if (newQueue.length === 0) {
      setShowEditQueue(false);
      setCurrentEditIndex(0);
    } else if (currentEditIndex >= newQueue.length) {
      setCurrentEditIndex(newQueue.length - 1);
    }
  };

  const closeEditQueue = () => {
    // Return all remaining items to completed list
    editingQueue.forEach((item) => {
      if (item.quantity) {
        setCompletedProductsIn((prev) => [...prev, item]);
      } else {
        const productWithQuantityOut = {
          product: item.product,
          quantityOut: item.quantityOut || "",
          selectedUnit: item.selectedUnit,
        };
        setCompletedProductsOut((prev) => [...prev, productWithQuantityOut]);
      }
    });

    setEditingQueue([]);
    setShowEditQueue(false);
    setCurrentEditIndex(0);
  };

  const updateCurrentProductInQuantity = (quantity: string) => {
    if (currentProductIn) {
      setCurrentProductIn({ ...currentProductIn, quantity });
    }
  };

  const updateCurrentProductOutQuantity = (quantityOut: string) => {
    if (currentProductOut) {
      setCurrentProductOut({ ...currentProductOut, quantityOut });
    }
  };

  const updateCurrentProductInUnit = (selectedUnit: string) => {
    if (currentProductIn) {
      setCurrentProductIn({ ...currentProductIn, selectedUnit });
    }
  };

  const updateCurrentProductOutUnit = (selectedUnit: string) => {
    if (currentProductOut) {
      setCurrentProductOut({ ...currentProductOut, selectedUnit });
    }
  };

  const handleResetIn = () => {
    setCurrentProductIn(null);
    setCompletedProductsIn([]);
    stockInForm.reset();
  };

  const handleResetOut = () => {
    setCurrentProductOut(null);
    setCompletedProductsOut([]);
    setStockWarnings([]);
    stockOutForm.reset();
  };

  // Functions to edit individual completed products
  const editCompletedProductIn = (productId: number) => {
    const productToEdit = completedProductsIn.find(
      (p) => p.product.id === productId,
    );
    if (productToEdit) {
      setCurrentProductIn(productToEdit);
      setCompletedProductsIn((prev) =>
        prev.filter((p) => p.product.id !== productId),
      );
    }
  };

  const editCompletedProductOut = (productId: number) => {
    const productToEdit = completedProductsOut.find(
      (p) => p.product.id === productId,
    );
    if (productToEdit) {
      setCurrentProductOut(productToEdit);
      setCompletedProductsOut((prev) =>
        prev.filter((p) => p.product.id !== productId),
      );
    }
  };

  // Mutations
  const stockInMutation = useMutation({
    mutationFn: async (
      transactions: Array<{
        productId: number;
        quantity: string;
        originalQuantity?: string;
        originalUnit?: string;
        poNumber?: string;
      }>,
    ) => {
      const results = [];
      for (const transaction of transactions) {
        const response = await apiRequest(
          "POST",
          "/api/transactions/stock-in",
          transaction,
        );
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
    mutationFn: async (
      transactions: Array<{
        productId: number;
        quantityOut: string;
        originalQuantity?: string;
        originalUnit?: string;
        soNumber?: string;
      }>,
    ) => {
      const results = [];
      for (const transaction of transactions) {
        const response = await apiRequest(
          "POST",
          "/api/transactions/stock-out",
          transaction,
        );
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
    const allProducts = [...completedProductsIn];

    // Add current product if it has quantity
    if (
      currentProductIn &&
      currentProductIn.quantity &&
      parseFloat(currentProductIn.quantity) > 0
    ) {
      allProducts.push(currentProductIn);
    }

    if (allProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product with quantity",
        variant: "destructive",
      });
      return;
    }

    const productItems: ProductItem[] = allProducts.map((item) => {
      const currentStock = parseFloat(item.product.currentStock);
      const convertedQuantity = parseFloat(
        convertToBaseUnit(item.quantity, item.selectedUnit, item.product),
      );
      const newStock = currentStock + convertedQuantity;

      return {
        product: item.product,
        quantity: convertToBaseUnit(
          item.quantity,
          item.selectedUnit,
          item.product,
        ),
        currentStock: item.product.currentStock,
        newStock: newStock.toString(),
        selectedUnit: item.selectedUnit,
      };
    });

    setTransactionPreview({
      products: productItems.map((item, index) => ({
        product: item.product.name,
        unit: item.product.unit,
        currentStock: item.currentStock,
        quantity: item.quantity,
        newStock: item.newStock,
        displayQuantity: formatDisplayQuantity(
          allProducts[index].quantity,
          allProducts[index].selectedUnit,
        ),
      })),
      date: new Date().toLocaleDateString(),
      poNumber: data.poNumber,
      type: "Stock In",
    });
  };

  const handlePreviewOut = (data: StockOutFormData) => {
    const allProducts = [...completedProductsOut];

    // Add current product if it has quantity
    if (
      currentProductOut &&
      currentProductOut.quantityOut &&
      parseFloat(currentProductOut.quantityOut) > 0
    ) {
      allProducts.push(currentProductOut);
    }

    if (allProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product with quantity",
        variant: "destructive",
      });
      return;
    }

    const productItems: ProductItem[] = allProducts.map((item) => {
      const currentStock = parseFloat(item.product.currentStock);
      const convertedQuantity = parseFloat(
        convertToBaseUnit(item.quantityOut, item.selectedUnit, item.product),
      );
      const newStock = currentStock - convertedQuantity;

      return {
        product: item.product,
        quantity: convertToBaseUnit(
          item.quantityOut,
          item.selectedUnit,
          item.product,
        ),
        currentStock: item.product.currentStock,
        newStock: newStock.toString(),
        selectedUnit: item.selectedUnit,
      };
    });

    setTransactionPreview({
      products: productItems.map((item, index) => ({
        product: item.product.name,
        unit: item.product.uni
