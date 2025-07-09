import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, Edit, Loader2 } from "lucide-react";

export interface ProductTransactionData {
  product: string;
  unit: string;
  currentStock: string;
  quantity: string;
  newStock: string;
  displayQuantity?: string;
}

export interface TransactionData {
  type: string;
  products: ProductTransactionData[];
  date: string;
  remarks?: string;
  soNumber?: string;
  poNumber?: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: (selectedProducts?: number[]) => void;
  title: string;
  transactionData: TransactionData;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  title,
  transactionData,
  isLoading = false,
}: ConfirmationDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showEditOptions, setShowEditOptions] = useState(false);

  // Format number to maximum 3 decimal places, removing unnecessary zeros
  const formatDecimal = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    
    // Return whole number if no decimals, otherwise format with up to 3 decimals and remove trailing zeros
    return num % 1 === 0 ? num.toString() : num.toFixed(3).replace(/\.?0+$/, '');
  };

  // Handle checkbox changes
  const handleProductSelect = (productIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productIndex]);
    } else {
      setSelectedProducts(prev => prev.filter(index => index !== productIndex));
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setSelectedProducts([]);
    setShowEditOptions(false);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    setIsConfirmed(false);
  };

  const handleEdit = () => {
    if (showEditOptions) {
      // If we're showing edit options and user clicks edit, pass selected products
      onEdit(selectedProducts);
      setIsConfirmed(false);
    } else {
      // First click - show edit options
      setShowEditOptions(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="transaction-details">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4" id="transaction-details">
          <div className="border-b pb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Transaction Type:</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {transactionData.type}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium text-gray-600">Date:</span>
              <span className="text-gray-900">{transactionData.date}</span>
            </div>
            {transactionData.soNumber && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium text-gray-600">SO Number:</span>
                <span className="text-gray-900">{transactionData.soNumber}</span>
              </div>
            )}
            {transactionData.poNumber && transactionData.type === 'Stock In' && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium text-gray-600">PO Number:</span>
                <span className="text-gray-900">{transactionData.poNumber}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Products ({transactionData.products.length}):
              {showEditOptions && (
                <span className="text-sm text-blue-600 font-normal ml-2">
                  Select products to edit
                </span>
              )}
            </h4>
            {transactionData.products.map((product, index) => (
              <div key={index} className={`bg-gray-50 p-3 rounded-lg ${showEditOptions ? 'border-2 border-gray-200' : ''}`}>
                <div className="flex items-start gap-3">
                  {showEditOptions && (
                    <Checkbox
                      checked={selectedProducts.includes(index)}
                      onCheckedChange={(checked) => handleProductSelect(index, checked === true)}
                      className="mt-1"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{product.product}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <div className="font-medium">{formatDecimal(product.currentStock)} {product.unit}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <div className="font-medium text-blue-600">
                          {product.displayQuantity ? (
                            <div>
                              <div>{product.displayQuantity}</div>
                              <div className="text-xs text-gray-500">({formatDecimal(product.quantity)} {product.unit})</div>
                            </div>
                          ) : (
                            <div>{formatDecimal(product.quantity)} {product.unit}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">New Stock:</span>
                        <div className="font-bold text-green-600">{formatDecimal(product.newStock)} {product.unit}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 py-3">
          <Checkbox
            id="confirm-checkbox"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked === true)}
          />
          <label
            htmlFor="confirm-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I confirm that the above details are correct
          </label>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              disabled={isLoading}
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              {showEditOptions ? (
                selectedProducts.length > 0 ? `Edit Selected (${selectedProducts.length})` : 'Select Products'
              ) : (
                'Edit Transaction'
              )}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isConfirmed || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Transaction
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
