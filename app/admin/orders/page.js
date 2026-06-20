"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  ShoppingBag,
  MoreHorizontal
} from "lucide-react";

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = Array.isArray(orders) ? orders.filter(o => {
    const matchesFilter = filter === "All" || o.status === filter;
    const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         o.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  if (loading && orders.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-950"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase">
            Order Management
          </h1>
          <p className="text-gray-400 font-medium tracking-tight">
            Track, fulfill, and manage your packaging shipments.
          </p>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 bg-gray-50 border border-gray-100 text-gray-950 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">
          <Download size={20} />
          EXPORT ORDERS
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-center justify-between w-full">
        <div className="flex-1 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm w-full md:max-w-md">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm font-medium"
          />
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full md:w-auto custom-scrollbar">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === status ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter">No orders found</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Either you have no orders yet or your filter settings are too restrictive.</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <table className="hidden lg:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Order Details</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Customer & Lab Info</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Items</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Amount</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Global Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if (e.target.tagName !== 'SELECT') {
                          window.location.href = `/admin/orders/${order.orderId}`;
                        }
                      }}
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="text-sm font-black text-gray-950 mb-1">{order.orderId}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="text-sm font-black text-gray-950">{order.customer?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase italic">{order.customer?.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-gray-950 text-white flex items-center justify-center text-[9px] font-black">{item.quantity}</span>
                                <span className="text-xs font-black text-gray-950 uppercase line-clamp-1">{item.name}</span>
                              </div>
                              {item.customDesign && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-7">
                                  <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">
                                    {item.customDesign.selectedGSM || "300 GSM"}
                                  </span>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {item.customDesign.selectedMaterial || "SBS"}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-950">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-950'
                            }`}>
                            {order.status}
                          </span>
                          {order.paid ? (
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest ml-1 italic">Authorized ✓</span>
                          ) : order.paymentDetails?.transactionId ? (
                             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest ml-1 animate-pulse">TXN Submitted ⚠</span>
                          ) : (
                             <span className="text-[8px] font-black text-red-400 uppercase tracking-widest ml-1">Unpaid ×</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right relative group">
                        <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-gray-950 transition-all"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="p-5 sm:p-6 space-y-4 hover:bg-gray-50/50 transition-colors cursor-pointer" 
                    onClick={(e) => {
                      if (e.target.tagName !== 'SELECT') {
                        window.location.href = `/admin/orders/${order.orderId}`;
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-gray-950 mb-1 truncate">{order.orderId}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-950'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-gray-950 truncate">{order.customer?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase italic truncate">{order.customer?.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-gray-950">₹{order.total?.toLocaleString('en-IN')}</p>
                        {order.paid ? (
                           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">Authorized ✓</p>
                        ) : order.paymentDetails?.transactionId ? (
                           <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1 animate-pulse">TXN ⚠</p>
                        ) : (
                           <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-1">Unpaid ×</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.items.length} item(s)</span>
                        <div onClick={e => e.stopPropagation()}>
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                className="bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-gray-950 transition-all"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
