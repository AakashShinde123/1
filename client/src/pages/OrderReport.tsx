


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
        setOrders(data.orders || data);
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

  // Download receipt handler (Updated with new style)
  const handleDownloadReceipt = (order: Order) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Order Receipt</title>
  <style>
    @media print {
      @page { size: auto; margin: 20mm; }
      body { background: #fff !important; }
      .print-btn { display: none !important; }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .receipt-box {
      width: 100%;
      max-width: 800px;
      margin: 40px auto;
      border: 1px solid #eee;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 2px 16px #eee;
      background: #fff;
      position: relative;
    }
    .logo {
      display: block;
      margin: 0 auto 16px auto;
      max-width: 160px;
    }
    h2 {
      text-align: center;
      background: linear-gradient(90deg, #4f46e5, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 2.4rem;
      font-weight: 800;
      margin-bottom: 24px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-family: 'Segoe UI', sans-serif;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    td { padding: 8px 0; }
    .label { color: #888; width: 40%; }
    .value { font-weight: bold; }
    .footer {
      text-align: center;
      color: #aaa;
      font-size: 14px;
      margin-top: 24px;
    }
    .print-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #4f46e5;
      border: none;
      border-radius: 50%;
      padding: 10px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .print-btn:hover {
      background: #4338ca;
    }
    .print-btn svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M19 8H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zM16 19H8v-5h8v5zm3-9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM17 4H7v4h10V4z"/>
      </svg>
    </button>
    <img src="http://localhost:5050/assets/111_1750417572953.png" alt="Sudhamrit Logo" class="logo" />
    <h2>Order Receipt</h2>
    <table>
      <tr><td class="label">Order #:</td><td class="value">${order.orderNumber}</td></tr>
      <tr><td class="label">Employee:</td><td class="value">${order.employeeName}</td></tr>
      <tr><td class="label">Customer Name:</td><td class="value">${order.customerName}</td></tr>
      <tr><td class="label">Customer Number:</td><td class="value">${order.customerNumber}</td></tr>
      <tr><td class="label">Order Items:</td><td class="value">${order.orderItems}</td></tr>
      <tr><td class="label">Delivery Date:</td><td class="value">${order.deliveryDate}</td></tr>
      <tr><td class="label">Delivery Time:</td><td class="value">${order.deliveryTime}</td></tr>
      <tr><td class="label">Created At:</td><td class="value">${order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td></tr>
    </table>
    <div class="footer">Thank you for your order!</div>
  </div>
</body>
</html>`;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 via-white to-indigo-100 px-2">
      <div className="w-full max-w-4xl bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-10 border border-lime-200 flex flex-col justify-center">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition w-full md:w-auto"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-800 text-center tracking-tight drop-shadow flex-1">
            Order Report
          </h1>
          <button
            onClick={handleDownload}
            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition disabled:opacity-50 w-full md:w-auto"
            disabled={orders.length === 0 || loading}
          >
            Download Report
          </button>
        </div>
        {loading && <div className="text-center text-lg text-gray-500 py-10">Loading...</div>}
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs md:text-sm rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-gradient-to-r from-lime-200 to-indigo-100 sticky top-0 z-10">
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Order #</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Employee</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Customer Name</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Customer Number</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Order Items</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Delivery Date</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Delivery Time</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Created At</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 border font-semibold text-gray-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-lime-50 transition">
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.orderNumber}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.employeeName}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.customerName}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.customerNumber}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.orderItems}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.deliveryDate}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.deliveryTime}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td>
                    <td className="border px-2 md:px-3 py-1 md:py-2">
                      <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-1 px-2 md:px-3 rounded shadow transition"
                        onClick={() => handleDownloadReceipt(order)}
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderReport;
