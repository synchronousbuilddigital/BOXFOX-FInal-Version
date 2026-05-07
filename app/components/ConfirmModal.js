"use client";
import React from 'react';

export default function ConfirmModal({ open, title, subText, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {subText && <p className="text-sm text-gray-600 mt-2">{subText}</p>}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-semibold">{cancelLabel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
