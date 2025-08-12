import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function OrderDetails() {
  const [showForm, setShowForm] = useState(false);
  const [, navigate] = useLocation();
  const [employeeName, setEmployeeName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderItem, setOrderItem] = useState("");
  const [customOrderItem, setCustomOrderItem] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let combinedOrderItems = "";
      if (orderItem && customOrderItem) {
        combinedOrderItems = `${orderItem}, ${customOrderItem}`;
      } else if (orderItem) {
        combinedOrderItems = orderItem;
      } else if (customOrderItem) {
        combinedOrderItems = customOrderItem;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: String(employeeName).trim(),
          customerName: String(customerName).trim(),
          customerNumber: String(customerNumber).trim(),
          orderNumber: String(orderNumber).trim(),
          orderItems: combinedOrderItems.trim(),
          deliveryDate: String(deliveryDate).trim(),
          deliveryTime: String(deliveryTime).trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save order details");
      setMessage("Order details saved successfully!");
      setEmployeeName("");
      setOrderNumber("");
      setOrderItem("");
      setCustomOrderItem("");
      setDeliveryDate("");
      setDeliveryTime("");
      setShowForm(false);
    } catch (err) {
      setMessage("Error saving order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Button
        variant="outline"
        className="flex items-center gap-2 mb-6"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <div className="flex flex-wrap justify-center gap-8 items-center">
        {/* Left-side Order Report button (only show when form is not open) */}
        {!showForm && (
          <div
            className="sketch-card sketch-card-lime cursor-pointer mb-6 transition-transform duration-200 hover:scale-105 border-2 border-lime-400 bg-gradient-to-br from-lime-100 to-lime-200 shadow-lg max-w-xs w-64 rounded-2xl shadow-2xl p-6 border border-lime-200 flex-shrink-0"
            onClick={() => navigate("/order-report")}
            style={{ userSelect: "none" }}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-md border-4 border-white">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M8 10h8M8 14h6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-indigo-800 mb-1 tracking-wide">
                Order Report
              </h3>
              <p className="text-indigo-700 text-xs">View all orders</p>
            </div>
          </div>
        )}

        {/* Order Details card */}
        {!showForm && (
          <div
            className="sketch-card sketch-card-lime cursor-pointer mb-6 transition-transform duration-200 hover:scale-105 border-2 border-lime-400 bg-gradient-to-br from-lime-100 to-lime-200 shadow-lg max-w-xs w-64 rounded-2xl shadow-2xl p-6 border border-lime-200 flex-shrink-0"
            onClick={() => setShowForm(true)}
            style={{ userSelect: "none" }}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <div className="mx-auto w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-md border-4 border-white">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M8 10h8M8 14h6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-indigo-800 mb-1 tracking-wide">
                Order Details
              </h3>
              <p className="text-indigo-700 text-xs">
                Click to fill order details
              </p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {message && (
          <div
            className={`mb-4 text-center rounded p-2 font-semibold ${
              message.includes("success")
                ? "bg-lime-100 text-lime-700 border border-lime-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {showForm && (
          <>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-md w-full rounded-2xl shadow-2xl p-10 border border-lime-200 bg-white"
            >
              <h1 className="text-3xl font-extrabold text-indigo-800 mb-8 text-center tracking-tight drop-shadow">
                Order Details
              </h1>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Customer Number
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Order Items
                </label>
                <div className="flex flex-col gap-2">
                  <select
                    className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                    value={orderItem}
                    onChange={(e) => setOrderItem(e.target.value)}
                  >
                    <option value="">Select a product</option>
                    <option value="Product A">Product A</option>
                    <option value="Product B">Product B</option>
                    <option value="Product C">Product C</option>
                    <option value="Product D">Product D</option>
                  </select>
                  <textarea
                    className="w-full h-40 text-lg border-2 border-lime-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm resize-none"
                    placeholder="Enter products..."
                    value={customOrderItem}
                    onChange={(e) => setCustomOrderItem(e.target.value)}
                  />
                  <span className="text-xs text-gray-500">
                    You can select a product, enter a custom item, or both.
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Delivery Time
                </label>
                <input
                  type="time"
                  className="w-full border-2 border-lime-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-lime-50 text-gray-900 font-medium shadow-sm"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="w-1/2 bg-gradient-to-r from-gray-200 to-lime-200 hover:from-gray-300 hover:to-lime-300 text-gray-800 font-bold py-2 px-4 rounded-xl border-2 border-lime-400 shadow transition-all duration-200"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-lime-500 to-indigo-500 hover:from-lime-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-xl border-2 border-lime-400 shadow transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
