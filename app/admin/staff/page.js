"use client";
import React, { useState, useEffect } from "react";
import { Shield, Search, UserPlus, MoreVertical, Check, X, Trash2, Mail } from "lucide-react";

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [searchRole, setSearchRole] = useState("staff_fulfillment");
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/staff');
            const data = await res.json();
            if (data.success) {
                setStaff(data.staff);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to load staff list.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const body = { email: searchEmail, role: searchRole };
            if (newName) body.name = newName;
            if (newPassword) body.password = newPassword;

            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setSearchEmail("");
                setNewName("");
                setNewPassword("");
                setSuccessMsg(data.message || "Action successful.");
                fetchStaff();
            } else {
                setError(data.error || "Failed to add staff member.");
            }
        } catch (err) {
            setError("Network error occurred.");
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleRemoveStaff = async (userId) => {
        if (!confirm("Are you sure you want to remove this user from the staff team? They will become a regular user.")) return;
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: userId, role: 'user' })
            });
            const data = await res.json();
            if (data.success) {
                setStaff(staff.filter(s => s._id !== userId));
            } else {
                alert(data.error || "Failed to remove staff access.");
            }
        } catch (err) {
            alert("Network error occurred.");
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: userId, role: newRole })
            });
            const data = await res.json();
            if (data.success) {
                setStaff(staff.map(s => s._id === userId ? { ...s, role: newRole } : s));
            } else {
                alert(data.error || "Failed to update role.");
                fetchStaff(); // Revert on failure
            }
        } catch (err) {
            alert("Network error occurred.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-gray-950 mb-2">Staff & Permissions</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Manage admin access and roles</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-between text-sm font-bold">
                    {error}
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center justify-between text-sm font-bold">
                    {successMsg}
                    <button onClick={() => setSuccessMsg(null)}><X size={16} /></button>
                </div>
            )}

            {/* Add Staff Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-950 mb-6 flex items-center gap-2">
                    <UserPlus size={18} className="text-emerald-500" />
                    Add or Create Staff
                </h2>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1 w-full relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Email Account *</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="email"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-1 w-full relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Full Name (if new)"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="lg:col-span-1 w-full relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Password (if new)"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="lg:col-span-1 w-full">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Assign Role *</label>
                        <select
                            value={searchRole}
                            onChange={(e) => setSearchRole(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                        >
                            <option value="staff_fulfillment">Fulfillment Manager</option>
                            <option value="admin">Super Admin</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1 w-full">
                        <button
                            type="submit"
                            disabled={isSearching || !searchEmail}
                            className="w-full px-4 py-3 bg-gray-950 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                            {isSearching ? 'Adding...' : 'Save User'}
                        </button>
                    </div>
                </form>
                <p className="text-[10px] font-medium text-gray-400 italic mt-4 ml-4">
                    Note: If the email already exists, it will just update their role (and optionally name/password). If it's a new email, you MUST provide a name and password to create the user account.
                </p>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">Team Member</th>
                                <th className="p-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">Role / Access Level</th>
                                <th className="p-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">Date Added</th>
                                <th className="p-6 text-right text-[10px] font-black tracking-widest text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => (
                                <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-black uppercase text-sm shadow-sm ring-2 ring-white">
                                                {member.name ? member.name.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-950">{member.name || 'Unnamed User'}</p>
                                                <p className="text-[11px] font-bold text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                                            className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-100 outline-none cursor-pointer hover:shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 appearance-none bg-white
                                                ${member.role === 'admin' ? 'text-indigo-600' : 'text-emerald-600'}
                                            `}
                                        >
                                            <option value="admin" className="font-bold">Super Admin</option>
                                            <option value="staff_fulfillment" className="font-bold">Fulfillment Mgr.</option>
                                        </select>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-bold text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleRemoveStaff(member._id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Revoke access"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
