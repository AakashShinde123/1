import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseExcelFile } from "../utils/excelUtils";
import { Customer, SalesOrder } from "@/types";
import { Printer, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DailyReport() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const handleUpload = async () => {
    if (!customerFile || !orderFile) {
      setError("Please upload both files.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const customerData = (await parseExcelFile(customerFile)) as Customer[];
      const salesOrderData = (await parseExcelFile(orderFile)) as SalesOrder[];
      setCustomers(customerData);
      setSalesOrders(salesOrderData);
    } catch (err) {
      setError("Error loading data. Please check your files.");
    } finally {
      setLoading(false);
    }
  };

  const getCustomerOrders = (customerId: string) => {
    return salesOrders.filter(order => order.customerId === customerId);
  };

  const handleReset = () => {
    setCustomers([]);
    setSalesOrders([]);
    setCustomerFile(null);
    setOrderFile(null);
    setError("");
  };

  const handlePrint = () => {
    if (reportRef.current) {
      const printContents = reportRef.current.innerHTML;
      const printWindow = window.open("", "", "height=900,width=800");
      const now = new Date().toLocaleString();
      printWindow!.document.write(`
        <html>
          <head>
            <title>Daily Report</title>
            <style>
              :root { color-scheme: light; }
              @page { size: A4; margin: 12mm 10mm; }
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              html, body { height: 100%; }
              body {
                font-family: Arial, Helvetica, sans-serif;
                color: #111827;
                line-height: 1.4;
              }
              .report-header {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #E5E7EB;
              }
              .report-title {
                font-size: 18px;
                font-weight: 700;
                margin: 0;
              }
              .report-meta {
                font-size: 12px;
                color: #6B7280;
                margin-left: 12px;
                white-space: nowrap;
              }
              .report-container {
                width: 100%;
              }
              table { width: 100%; border-collapse: collapse; }
              thead tr th {
                background: #F3F4F6;
                color: #111827;
                font-size: 12px;
                font-weight: 700;
                text-align: left;
                border: 0.6px solid #E5E7EB;
                padding: 8px 10px;
              }
              tbody tr td {
                font-size: 12px;
                border: 0.6px solid #E5E7EB;
                padding: 8px 10px;
                vertical-align: top;
              }
              tbody tr:nth-child(even) td { background: #FAFAFA; }
              .align-right { text-align: right; }
              .muted { color: #6B7280; }
              .small { font-size: 11px; }
              /* Avoid breaking rows across pages */
              tr { page-break-inside: avoid; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            </style>
          </head>
          <body>
            <div class="report-header">
              <h1 class="report-title">Daily Report</h1>
              <div class="report-meta">Printed: ${now}</div>
            </div>
            <div class="report-container">${printContents}</div>
          </body>
        </html>
      `);
      printWindow!.document.close();
      printWindow!.focus();
      printWindow!.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50/60 rounded-full px-3"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>

        <Card className="shadow-2xl border border-transparent backdrop-blur supports-[backdrop-filter]:bg-white/70 rounded-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-2xl">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center flex items-center justify-between md:justify-center gap-3">
              <span className="sr-only md:not-sr-only md:opacity-0">.</span>
              Daily Report
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePrint}
                title="Print Report"
                className="bg-white text-indigo-600 hover:bg-gray-100 shadow-md"
              >
                <Printer className="w-5 h-5" />
              </Button>
            </CardTitle>
            <p className="text-center text-indigo-100 text-sm md:text-base">Upload customer and order files to generate a polished daily report.</p>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            {/* Upload Section */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-center">
              <div className="flex-1 min-w-[260px]">
                <label className="font-semibold text-sm text-gray-700">Customer File</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={e => setCustomerFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    id="customer-file-upload"
                    style={{ fontSize: '16px', minHeight: '44px' }}
                  />
                  <span className="text-sm text-gray-600 truncate max-w-[240px]">
                    {customerFile ? customerFile.name : "No file chosen"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[260px]">
                <label className="font-semibold text-sm text-gray-700">Sales Order File</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={e => setOrderFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    id="order-file-upload"
                    style={{ fontSize: '16px', minHeight: '44px' }}
                  />
                  <span className="text-sm text-gray-600 truncate max-w-[240px]">
                    {orderFile ? orderFile.name : "No file chosen"}
                  </span>
                </div>
              </div>
              <div className="flex items-stretch gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg px-6 py-5 md:py-2 rounded-xl"
                >
                  {loading ? "Loading..." : "Upload & Show Report"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200 shadow px-6 py-5 md:py-2 rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-semibold mb-6">
                {error}
              </p>
            )}

            {/* Report Table */}
            <div ref={reportRef} className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xl bg-white">
              {customers.length === 0 && !loading && !error && (
                <div className="py-16 px-6 text-center text-gray-600">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center">📄</div>
                  <p className="font-medium">No customers found</p>
                  <p className="text-sm text-gray-500">Please upload both files to generate the report.</p>
                </div>
              )}
              {customers.length > 0 && (
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur">
                    <tr className="text-gray-700 text-xs uppercase tracking-wide">
                      <th className="p-2 text-xs border-b border-gray-200">Customer Code</th>
                      <th className="p-2 text-xs border-b border-gray-200">Customer Name</th>
                      <th className="p-2 text-xs border-b border-gray-200">SO Date</th>
                      <th className="p-2 text-xs border-b border-gray-200">Item Name</th>
                      <th className="p-2 text-xs border-b border-gray-200">SO NO</th>
                      <th className="p-2 text-xs border-b border-gray-200">SO Quantity</th>
                      <th className="p-2 text-xs border-b border-gray-200">Address 1</th>
                      <th className="p-2 text-xs border-b border-gray-200">Address 2</th>
                      <th className="p-2 text-xs border-b border-gray-200">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => {
                      const orders = getCustomerOrders(customer.id);
                      if (orders.length === 0) {
                        return (
                          <tr key={customer.id} className="odd:bg-white even:bg-gray-50 hover:bg-indigo-50/60 transition-colors">
                            <td className="p-2 text-sm border-b border-gray-100">{customer.id}</td>
                            <td className="p-2 text-sm border-b border-gray-100">{customer.name}</td>
                            <td colSpan={7} className="p-2 text-sm text-gray-500 border-b border-gray-100 text-center">
                              <span className="inline-block rounded-full bg-yellow-50 text-yellow-700 px-3 py-1 text-xs font-medium">No orders found</span>
                            </td>
                          </tr>
                        );
                      }
                      return orders.flatMap((order, orderIdx) => 
                        order.items.map((item, itemIdx) => {
                          // Calculate quantity per item (divide total by number of items)
                          const quantityPerItem = Math.ceil(order.quantity / order.items.length);
                          // Check if this is the last item of the order
                          const isLastItemOfOrder = itemIdx === order.items.length - 1;
                          
                          // Format date properly
                          const formatDate = (dateValue: any) => {
                            if (!dateValue) return "";
                            
                            // If it's already a readable date string, return it
                            if (typeof dateValue === 'string' && dateValue.includes('/')) {
                              return dateValue;
                            }
                            
                            // If it's an Excel serial number, convert it
                            if (typeof dateValue === 'number') {
                              const excelEpoch = new Date(1899, 11, 30); // Excel epoch
                              const jsDate = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
                              return jsDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
                            }
                            
                            // Try to parse as date
                            try {
                              const date = new Date(dateValue);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
                              }
                            } catch (e) {
                              // If parsing fails, return original value
                            }
                            
                            return String(dateValue);
                          };
                          
                          return (
                            <tr
                              key={`${customer.id}-${order.id}-${orderIdx}-${itemIdx}`}
                              className="odd:bg-white even:bg-gray-50 hover:bg-indigo-50/60 transition-colors"
                            >
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{customer.id}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{customer.name}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{formatDate(order.deliveryDate)}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{item}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{order.orderNumber}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{quantityPerItem}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{customer.address1 || ""}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{customer.address2 || ""}</td>
                              <td className={`p-2 text-sm border-b border-gray-100 ${isLastItemOfOrder ? 'border-b-2 border-b-indigo-400' : ''}`}>{customer.phone || ""}</td>
                            </tr>
                          );
                        })
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
