import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Users, X, Check, Share2, Loader2 } from "lucide-react";

const API = "http://localhost:5050/api";

/**
 * ShareModal — used by admin to share a Board or Document with team members.
 *
 * Props:
 *   isOpen      {boolean}   — whether modal is shown
 *   onClose     {fn}        — close handler
 *   resourceType {"board"|"doc"} — what we're sharing
 *   resourceId  {string}    — UUID of the board or doc
 *   isDark      {boolean}
 */
const ShareModal = ({ isOpen, onClose, resourceType, resourceId, isDark }) => {
    const [targets, setTargets] = useState([]); // List of possible share targets (members + clients)
    const [shares, setShares] = useState([]);   // List of active shares: { type, email, permission }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const dm = isDark;

    useEffect(() => {
        if (!isOpen || !resourceId) return;
        setLoading(true);
        setSaved(false);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const endpoint = resourceType === "board"
            ? `/boards/${resourceId}/shared-members`
            : `/docs/${resourceId}/shared-members`;

        Promise.all([
            axios.get(`${API}/members-list`, { headers }),
            axios.get(`${API}/clients`, { headers }),
            axios.get(`${API}${endpoint}`, { headers })
        ]).then(([membersRes, clientsRes, accessRes]) => {
            const allTargets = [
                ...(membersRes.data || []).map(m => ({ ...m, type: "member" })),
                ...(clientsRes.data || []).map(c => ({ ...c, type: "client" }))
            ];
            setTargets(allTargets);
            
            // Map existing accesses to our state
            const existing = (accessRes.data || []).map(a => ({
                type: a.targetType || a.TargetType,
                email: a.targetEmail || a.TargetEmail,
                permission: a.permission || "viewer"
            }));
            setShares(existing);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [isOpen, resourceId, resourceType]);

    const toggle = (target) => {
        const isSelected = shares.some(s => s.email === target.email);
        if (isSelected) {
            setShares(prev => prev.filter(s => s.email !== target.email));
        } else {
            // Default to viewer for clients, and editor for members initially
            setShares(prev => [...prev, {
                type: target.type,
                email: target.email,
                permission: target.type === "client" ? "viewer" : "editor"
            }]);
        }
    };

    const updatePermission = (email, perm) => {
        setShares(prev => prev.map(s => s.email === email ? { ...s, permission: perm } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem("token");
        const endpoint = resourceType === "board"
            ? `/boards/${resourceId}/share`
            : `/docs/${resourceId}/share`;
        try {
            await axios.post(`${API}${endpoint}`, shares, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
            setTimeout(() => { setSaved(false); onClose(); }, 1200);
        } catch {
            alert("Failed to save sharing settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className={`w-full max-w-md rounded-2xl shadow-2xl border ${dm ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${dm ? "border-slate-800" : "border-slate-100"}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Share2 size={14} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${dm ? "text-white" : "text-slate-900"}`}>
                                        Share {resourceType === "board" ? "Board" : "Document"}
                                    </h3>
                                    <p className={`text-[10px] ${dm ? "text-slate-500" : "text-slate-400"}`}>
                                        Team Members can be Editors or Viewers. Clients are View-Only.
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className={`p-1.5 rounded-lg ${dm ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                    <Loader2 size={18} className="animate-spin text-indigo-500" />
                                    <span className={`text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>Loading people…</span>
                                </div>
                            ) : targets.length === 0 ? (
                                <div className={`text-center py-8 text-sm ${dm ? "text-slate-500" : "text-slate-400"}`}>
                                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                                    No team members or clients found.
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                    {targets.map(t => {
                                        const share = shares.find(s => s.email === t.email);
                                        const isSelected = !!share;
                                        return (
                                            <div
                                                key={t.email}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${
                                                    isSelected
                                                        ? "bg-indigo-50/50 border-indigo-200"
                                                        : dm
                                                            ? "hover:bg-slate-800 border-transparent shadow-sm"
                                                            : "hover:bg-slate-50 border-transparent"
                                                }`}
                                            >
                                                {/* Checkbox trigger area */}
                                                <div 
                                                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                                                    onClick={() => toggle(t)}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                        style={{ backgroundColor: t.color || "#6366f1" }}
                                                    >
                                                        {t.initials || t.name?.slice(0, 2).toUpperCase() || "?"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className={`text-xs font-bold truncate ${isSelected ? "text-indigo-700" : dm ? "text-white" : "text-slate-800"}`}>
                                                                {t.name}
                                                            </p>
                                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                                t.type === 'member' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                                {t.type}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[10px] truncate ${isSelected ? "text-indigo-500" : dm ? "text-slate-500" : "text-slate-400"}`}>
                                                            {t.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Permission Toggle */}
                                                {isSelected && (
                                                    <div className="flex gap-1 bg-white/50 backdrop-blur rounded-lg p-0.5 border border-indigo-100">
                                                        {t.type === "member" ? (
                                                            <>
                                                                <button
                                                                    onClick={() => updatePermission(t.email, "viewer")}
                                                                    className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${share.permission === 'viewer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                                                                >
                                                                    Viewer
                                                                </button>
                                                                <button
                                                                    onClick={() => updatePermission(t.email, "editor")}
                                                                    className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${share.permission === 'editor' ? 'bg-brand text-white shadow-sm' : 'text-slate-400 hover:text-brand'}`}
                                                                >
                                                                    Editor
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="px-3 py-1 text-[9px] font-bold text-emerald-700">View Only</span>
                                                        )}
                                                    </div>
                                                )}

                                                <button 
                                                    onClick={() => toggle(t)}
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                                        isSelected ? "bg-indigo-600 border-indigo-600 text-white" : dm ? "border-slate-600 text-transparent" : "border-slate-300 text-transparent"
                                                    }`}
                                                >
                                                    <Check size={11} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`flex items-center justify-between px-5 py-3 border-t ${dm ? "border-slate-800" : "border-slate-100"}`}>
                            <span className={`text-xs ${dm ? "text-slate-500" : "text-slate-400"}`}>
                                {shares.length} people selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${dm ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60"
                                >
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Share2 size={12} />}
                                    {saved ? "Shared!" : "Save Access"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
