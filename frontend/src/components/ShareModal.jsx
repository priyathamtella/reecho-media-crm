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
    const [members, setMembers] = useState([]);
    const [selected, setSelected] = useState([]);
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
            axios.get(`${API}${endpoint}`, { headers })
        ]).then(([membersRes, accessRes]) => {
            setMembers(membersRes.data || []);
            setSelected((accessRes.data || []).map(Number));
        }).catch(() => {}).finally(() => setLoading(false));
    }, [isOpen, resourceId, resourceType]);

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem("token");
        const endpoint = resourceType === "board"
            ? `/boards/${resourceId}/share`
            : `/docs/${resourceId}/share`;
        try {
            await axios.post(`${API}${endpoint}`, { memberIds: selected }, {
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
                        className={`w-full max-w-sm rounded-2xl shadow-2xl border ${dm ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}
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
                                        Select team members to assign access
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
                                    <span className={`text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>Loading members…</span>
                                </div>
                            ) : members.length === 0 ? (
                                <div className={`text-center py-8 text-sm ${dm ? "text-slate-500" : "text-slate-400"}`}>
                                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                                    No team members found. Add team members first.
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                    {members.map(m => {
                                        const isSelected = selected.includes(m.id);
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => toggle(m.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                                                    isSelected
                                                        ? "bg-indigo-50 border border-indigo-200"
                                                        : dm
                                                            ? "hover:bg-slate-800 border border-transparent"
                                                            : "hover:bg-slate-50 border border-transparent"
                                                }`}
                                            >
                                                {/* Avatar */}
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: m.color || "#6366f1" }}
                                                >
                                                    {m.initials || m.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${isSelected ? "text-indigo-700" : dm ? "text-white" : "text-slate-800"}`}>
                                                        {m.name}
                                                    </p>
                                                    <p className={`text-[10px] truncate ${isSelected ? "text-indigo-500" : dm ? "text-slate-500" : "text-slate-400"}`}>
                                                        {m.role} · {m.email}
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                    isSelected ? "bg-indigo-600 border-indigo-600" : dm ? "border-slate-600" : "border-slate-300"
                                                }`}>
                                                    {isSelected && <Check size={11} className="text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`flex items-center justify-between px-5 py-3 border-t ${dm ? "border-slate-800" : "border-slate-100"}`}>
                            <span className={`text-xs ${dm ? "text-slate-500" : "text-slate-400"}`}>
                                {selected.length} member{selected.length !== 1 ? "s" : ""} selected
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
