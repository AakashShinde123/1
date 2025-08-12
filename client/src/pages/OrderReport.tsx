
import React, { useEffect, useState } from "react";

interface Order {
  id: number;
  employeeName: string;
  customerName: string;
  customerNumber: string;
  orderNumber: string;
  orderItems: string;
  deliveryDate: string;
  deliveryTime: string;
  createdAt: string;
}

const OrderReport: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(data => {
        setOrders(data.orders || data); // support both {orders:[]} and []
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load order report.");
        setLoading(false);
      });
  }, []);

  // CSV download handler
  const handleDownload = () => {
    if (!orders.length) return;
    const header = [
      "Order #",
      "Employee",
      "Customer Name",
      "Customer Number",
      "Order Items",
      "Delivery Date",
      "Delivery Time",
      "Created At"
    ];
    const rows = orders.map(order => [
      order.orderNumber,
      order.employeeName,
      order.customerName,
      order.customerNumber,
      order.orderItems,
      order.deliveryDate,
      order.deliveryTime,
      order.createdAt ? new Date(order.createdAt).toLocaleString() : ""
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-report-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download receipt handler
  const handleDownloadReceipt = (order: Order) => {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Order Receipt</title><style>body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; } .receipt-box { max-width: 400px; margin: auto; border: 1px solid #eee; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px #eee; } h2 { text-align: center; color: #4f46e5; margin-bottom: 16px; } table { width: 100%; border-collapse: collapse; margin-bottom: 12px; } td { padding: 6px 0; } .label { color: #888; width: 40%; } .value { font-weight: bold; } .footer { text-align: center; color: #aaa; font-size: 12px; margin-top: 16px; }</style></head><body><div class="receipt-box"><h2>Order Receipt</h2><table><tr><td class="label">Order #:</td><td class="value">${order.orderNumber}</td></tr><tr><td class="label">Employee:</td><td class="value">${order.employeeName}</td></tr><tr><td class="label">Customer Name:</td><td class="value">${order.customerName}</td></tr><tr><td class="label">Customer Number:</td><td class="value">${order.customerNumber}</td></tr><tr><td class="label">Order Items:</td><td class="value">${order.orderItems}</td></tr><tr><td class="label">Delivery Date:</td><td class="value">${order.deliveryDate}</td></tr><tr><td class="label">Delivery Time:</td><td class="value">${order.deliveryTime}</td></tr><tr><td class="label">Created At:</td><td class="value">${order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td></tr></table><div class="footer">Thank you for your order!</div></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-order-${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 via-white to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-10 border border-lime-200">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded shadow transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-indigo-800 text-center tracking-tight drop-shadow flex-1">Order Report</h1>
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownload}
            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded shadow transition disabled:opacity-50"
            disabled={orders.length === 0 || loading}
          >
            Download Report
          </button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-lime-100">
                  <th className="px-3 py-2 border">Order #</th>
                  <th className="px-3 py-2 border">Employee</th>
                  <th className="px-3 py-2 border">Customer Name</th>
                  <th className="px-3 py-2 border">Customer Number</th>
                  <th className="px-3 py-2 border">Order Items</th>
                  <th className="px-3 py-2 border">Delivery Date</th>
                  <th className="px-3 py-2 border">Delivery Time</th>
                  <th className="px-3 py-2 border">Created At</th>
                  <th className="px-3 py-2 border">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-4">No orders found.</td></tr>
                )}
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-lime-50">
                    <td className="border px-2 py-1">{order.orderNumber}</td>
                    <td className="border px-2 py-1">{order.employeeName}</td>
                    <td className="border px-2 py-1">{order.customerName}</td>
                    <td className="border px-2 py-1">{order.customerNumber}</td>
                    <td className="border px-2 py-1">{order.orderItems}</td>
                    <td className="border px-2 py-1">{order.deliveryDate}</td>
                    <td className="border px-2 py-1">{order.deliveryTime}</td>
                    <td className="border px-2 py-1">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-1 px-2 rounded shadow"
                        onClick={() => handleDownloadReceipt(order)}
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
{/* // ...existing code... */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderReport;
