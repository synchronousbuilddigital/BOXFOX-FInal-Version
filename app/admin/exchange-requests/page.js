"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Package, Clock, CheckCircle, AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ExchangeRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exchange-request');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonBadge = (reason) => {
    const reasons = {
      'damaged': { label: 'Damaged/Defective', color: 'bg-red-50 text-red-700 border border-red-200' },
      'wrong': { label: 'Wrong Item', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
      'mistake': { label: 'Ordered by Mistake', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
      'quality': { label: 'Quality Issues', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      'other': { label: 'Other', color: 'bg-gray-50 text-gray-700 border border-gray-200' }
    };
    
    const info = reasons[reason] || reasons['other'];
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${info.color}`}>{info.label}</span>;
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  if (selectedRequest) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedRequest(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-bold"
          >
            <ArrowLeft size={18} />
            Back to List
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-950">
                Request Details
              </h1>
              <span className={`px-6 py-2 rounded-full text-sm font-black uppercase ${getStatusColor(selectedRequest.status)}`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 mb-1">Name</p>
                  <p className="text-lg font-bold text-gray-950">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-gray-950 font-mono bg-gray-50 p-3 rounded-xl">{selectedRequest.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 mb-1">Reason</p>
                  {getReasonBadge(selectedRequest.reason)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 mb-1 flex items-center gap-2">
                    <Mail size={14} /> Email
                  </p>
                  <a href={`mailto:${selectedRequest.email}`} className="text-lg font-bold text-emerald-600 hover:text-emerald-700">
                    {selectedRequest.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 mb-1 flex items-center gap-2">
                    <Phone size={14} /> Contact Number
                  </p>
                  <a href={`tel:${selectedRequest.contactNumber}`} className="text-lg font-bold text-emerald-600 hover:text-emerald-700">
                    {selectedRequest.contactNumber}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 mb-1 flex items-center gap-2">
                    <Clock size={14} /> Submitted
                  </p>
                  <p className="text-lg font-bold text-gray-950">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {selectedRequest.subject && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                <p className="text-xs font-black uppercase text-gray-400 mb-2">Subject</p>
                <p className="text-gray-950 font-medium">{selectedRequest.subject}</p>
              </div>
            )}

            <div className="mb-8 p-8 bg-gray-50 rounded-2xl border-l-4 border-emerald-500">
              <p className="text-xs font-black uppercase text-gray-400 mb-4">Message</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedRequest.message}
              </p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs py-4 hover:bg-emerald-600 transition-all">
                Mark as Processing
              </button>
              <button className="flex-1 bg-gray-950 text-white rounded-xl font-black uppercase text-xs py-4 hover:bg-gray-800 transition-all">
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-950 mb-2">
              Exchange Requests
            </h1>
            <p className="text-gray-500 font-bold">Manage customer return and exchange requests</p>
          </div>
          <Link href="/admin" className="flex items-center gap-2 px-6 py-3 bg-gray-950 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all">
            <ArrowLeft size={16} /> Back to Admin
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['all', 'pending', 'processing', 'completed', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-full font-black uppercase text-xs transition-all ${
                filterStatus === status
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-white text-gray-950 border border-gray-200 hover:border-emerald-500'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredRequests.filter(r => filterStatus === 'all' ? true : r.status === status).length})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Package className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500 font-bold">No exchange requests found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map(request => (
              <div
                key={request._id}
                onClick={() => setSelectedRequest(request)}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-gray-950 text-lg truncate">{request.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Order #</p>
                        <p className="font-mono text-sm text-gray-950 font-bold">{request.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Reason</p>
                        {getReasonBadge(request.reason)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Contact</p>
                        <a href={`mailto:${request.email}`} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 truncate">
                          {request.email}
                        </a>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      Submitted: {new Date(request.createdAt).toLocaleDateString('en-IN')} at {new Date(request.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <package size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
