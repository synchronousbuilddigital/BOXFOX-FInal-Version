"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorWallet() {
    const router = useRouter();
    const [wallet, setWallet] = useState({ balance: 0, totalEarned: 0, totalWithdrawn: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawError, setWithdrawError] = useState("");
    const [withdrawSuccess, setWithdrawSuccess] = useState("");

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const res = await fetch('/api/vendor/wallet');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setWallet(data.wallet);
                setTransactions(data.transactions);
            } else {
                setError(data.error || "Failed to load wallet data.");
            }
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawError("");
        setWithdrawSuccess("");
        
        if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) < 500) {
            setWithdrawError("Minimum withdrawal amount is ₹500");
            return;
        }

        if (Number(withdrawAmount) > wallet.balance) {
            setWithdrawError("Insufficient balance");
            return;
        }

        setIsWithdrawing(true);
        try {
            const res = await fetch('/api/vendor/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(withdrawAmount) })
            });
            const data = await res.json();
            
            if (data.success) {
                setWithdrawSuccess(`Successfully requested withdrawal of ₹${withdrawAmount}`);
                setWithdrawAmount("");
                fetchWalletData(); // Refresh data
            } else {
                setWithdrawError(data.error || "Failed to request withdrawal.");
            }
        } catch (err) {
            setWithdrawError("An error occurred. Please try again.");
        } finally {
            setIsWithdrawing(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Earnings & Wallet</h1>
                <p className="text-gray-500 mt-1">Manage your funds, track sales, and withdraw your earnings.</p>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Available Balance</p>
                        <h2 className="text-4xl font-black text-emerald-400">₹{wallet.balance.toFixed(2)}</h2>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500 opacity-20 rounded-full blur-2xl"></div>
                </div>
                
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Earned</p>
                    <h2 className="text-3xl font-black text-gray-900">₹{wallet.totalEarned.toFixed(2)}</h2>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Withdrawn</p>
                    <h2 className="text-3xl font-black text-gray-900">₹{wallet.totalWithdrawn.toFixed(2)}</h2>
                </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Request Withdrawal</h3>
                <form onSubmit={handleWithdraw} className="max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                            <input 
                                type="number" 
                                min="500"
                                max={wallet.balance}
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                placeholder="Min. ₹500"
                            />
                        </div>
                    </div>
                    
                    {withdrawError && <p className="text-red-500 text-sm font-medium">{withdrawError}</p>}
                    {withdrawSuccess && <p className="text-emerald-500 text-sm font-medium">{withdrawSuccess}</p>}

                    <button 
                        type="submit" 
                        disabled={isWithdrawing || wallet.balance < 500}
                        className="w-full py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isWithdrawing ? 'Processing...' : 'Withdraw to Bank'}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Funds will be transferred to your registered bank account within 2-3 business days.</p>
                </form>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {tx.description}
                                            {tx.adminNotes && <p className="text-xs text-gray-500 font-normal mt-1">Note: {tx.adminNotes}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {tx.type}
                                            </span>
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
                                        <td className={`px-6 py-4 text-right font-bold ${
                                            tx.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'
                                        }`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
