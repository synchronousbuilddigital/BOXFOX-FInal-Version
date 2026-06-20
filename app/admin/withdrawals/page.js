"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminWithdrawals() {
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null); // stores ID of processing tx
    const [notes, setNotes] = useState({}); // object to store notes by tx id

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setWithdrawals(data.withdrawals);
            } else {
                setError(data.error || "Failed to load withdrawals.");
            }
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
        
        setActionLoading(id);
        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    action, 
                    adminNotes: notes[id] || '' 
                })
            });
            const data = await res.json();
            
            if (data.success) {
                // Update local state
                setWithdrawals(withdrawals.map(w => w._id === id ? { ...w, status: data.transaction.status, adminNotes: data.transaction.adminNotes } : w));
            } else {
                alert(data.error || "Failed to process request.");
            }
        } catch (err) {
            alert("An error occurred. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleNoteChange = (id, value) => {
        setNotes({ ...notes, [id]: value });
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vendor Withdrawals</h1>
                <p className="text-gray-500 mt-1">Review and process vendor payout requests.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <>
                    {/* Responsive Table View */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Vendor Info</th>
                                    <th className="px-6 py-4">Bank Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-white">No withdrawal requests found.</td>
                                    </tr>
                                ) : (
                                    withdrawals.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors bg-white">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {tx.vendorId ? (
                                                    <>
                                                        <p className="text-sm font-bold text-gray-900">{tx.vendorId.name}</p>
                                                        <p className="text-xs text-gray-500">{tx.vendorId.businessName || 'No Business Name'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{tx.vendorId.email}</p>
                                                        <p className="text-xs text-gray-400">{tx.vendorId.phone}</p>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Vendor Deleted</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {tx.vendorId ? (
                                                    <>
                                                        <p className="text-xs font-semibold text-gray-900">Bank: <span className="font-normal">{tx.vendorId.vendorBankName || 'N/A'}</span></p>
                                                        <p className="text-xs font-semibold text-gray-900">A/C: <span className="font-normal">{tx.vendorId.vendorBankAccountNo || 'N/A'}</span></p>
                                                        <p className="text-xs font-semibold text-gray-900">IFSC: <span className="font-normal">{tx.vendorId.vendorIfscCode || 'N/A'}</span></p>
                                                        <p className="text-xs font-semibold text-gray-900 mt-1">PAN: <span className="font-normal">{tx.vendorId.vendorPan || 'N/A'}</span></p>
                                                    </>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    tx.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                    tx.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-red-50 text-red-700'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                ₹{tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 min-w-[250px]">
                                                {tx.status === 'pending' ? (
                                                    <div className="space-y-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Notes (e.g., Transfer Ref #)" 
                                                            value={notes[tx._id] || ''}
                                                            onChange={(e) => handleNoteChange(tx._id, e.target.value)}
                                                            className="w-full text-xs p-2 border border-gray-200 rounded focus:border-black outline-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleAction(tx._id, 'approve')}
                                                                disabled={actionLoading === tx._id}
                                                                className="flex-1 bg-black text-white text-xs font-bold py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                            >
                                                                {actionLoading === tx._id ? '...' : 'Approve'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(tx._id, 'reject')}
                                                                disabled={actionLoading === tx._id}
                                                                className="flex-1 bg-red-50 text-red-600 border border-red-100 text-xs font-bold py-2 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            >
                                                                {actionLoading === tx._id ? '...' : 'Reject'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">
                                                        Processed.<br/>
                                                        {tx.adminNotes && <span className="text-gray-700 not-italic block mt-1">Note: {tx.adminNotes}</span>}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            </div>
        </div>
    );
}
