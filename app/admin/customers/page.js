"use client";
import React from "react";
import {
    Users,
    ShieldCheck,
    Trash2,
    Search,
    Mail,
    Phone,
    Calendar
} from "lucide-react";

export default function CustomersManager() {
    const [customers, setCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/customers');
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCustomers();
        const searchParams = new URLSearchParams(window.location.search);
        const search = searchParams.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCustomers();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase">Customer Directory</h1>
                <p className="text-gray-400 font-medium tracking-tight">Manage and view your B2B & B2C customer relationships.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex-1 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm w-full max-w-md focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="bg-transparent outline-none w-full text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse">
                            <div className="w-12 h-12 bg-gray-50 rounded-full mx-auto mb-4" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing global registry...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Customer Profile</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Contact Info</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Financial Volume</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Joined Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Account Role</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Global Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Orders</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Spent</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Cart/Wishlist</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-8 py-20 text-center text-gray-400 font-medium">No customers found</td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black border border-gray-100">
                                                        {user.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <p className="text-sm font-black text-gray-950">{user.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                        <Mail size={12} className="text-gray-300" /> {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                            <Phone size={12} className="text-gray-300" /> {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                        Total Revenue: <span className="text-emerald-500 font-black text-xs">₹{user.totalSpent?.toLocaleString('en-IN') || 0}</span>
                                                    </div>
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                                                        Orders: {user.totalOrders || 0} | Items added: {user.productsOrdered || 0}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-950">
                                                {user.totalOrders || 0}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-emerald-500">
                                                ₹{(user.totalSpent || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex gap-3 text-xs font-bold text-gray-400">
                                                    <span title="Cart Items">🛒 {user.cartCount || 0}</span>
                                                    <span title="Wishlist Items">❤️ {user.wishlistCount || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <button onClick={() => handleDelete(user._id)} className="p-2 text-gray-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

