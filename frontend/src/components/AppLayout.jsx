import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    LayoutGrid, Plus, LogOut, Sun, Moon, ChevronRight,
    Loader2, FolderOpen, X, Trash2, FileText,
    CheckSquare, Calendar, Users, Briefcase, CreditCard, ExternalLink, Share2
} from "lucide-react";
import ShareModal from "./ShareModal";

const API = "https://api.reechomedia.com/api";

const AppLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [boards, setBoards] = useState([]);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [creatingDoc, setCreatingDoc] = useState(false);
    // Share modal state
    const [shareTarget, setShareTarget] = useState(null); // { type: 'board'|'doc', id: string }
    
    const userName = localStorage.getItem("userName") || "User";
    const userEmail = localStorage.getItem("userEmail") || "";
    const userRole = localStorage.getItem("userRole") || "admin";
    const [currentPage, setCurrentPage] = useState(userRole === "client" ? "portal" : "overview");


    // Apply dark mode
    useEffect(() => {
        if (isDark) { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); }
        else { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); }
    }, [isDark]);

    // Active IDs from URL
    const activeBoardId = location.pathname.startsWith("/boards/") ? location.pathname.split("/boards/")[1] : null;
    const activeDocId = location.pathname.startsWith("/docs/") ? location.pathname.split("/docs/")[1] : null;

    // Fetch boards + docs
    const fetchBoards = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        try {
            const res = await axios.get(`${API}/boards?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
            setBoards(res.data || []);
        } catch (err) { if (err.response?.status === 401) navigate("/login"); }
        finally { setLoading(false); }
    };

    const fetchDocs = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(`${API}/docs`, { headers: { Authorization: `Bearer ${token}` } });
            setDocs(res.data || []);
        } catch { }
    };

    useEffect(() => { fetchBoards(); fetchDocs(); }, [location.pathname]);

    // Create board
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${API}/boards`, { title: newTitle }, { headers: { Authorization: `Bearer ${token}` } });
            const newId = res.data?.id || res.data?.ID;
            setBoards(prev => [...prev, res.data]);
            setShowModal(false); setNewTitle("");
            navigate(`/boards/${newId}`);
        } catch { alert("Failed to create board."); }
        finally { setCreating(false); }
    };

    // Create document
    const handleCreateDoc = async () => {
        setCreatingDoc(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${API}/docs`, { title: "Untitled Document" }, { headers: { Authorization: `Bearer ${token}` } });
            const newId = res.data?.id || res.data?.ID;
            setDocs(prev => [res.data, ...prev]);
            navigate(`/docs/${newId}`);
        } catch { alert("Failed to create document."); }
        finally { setCreatingDoc(false); }
    };

    // Delete board
    const handleDeleteBoard = async (e, boardId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this board? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API}/boards/${boardId}`, { headers: { Authorization: `Bearer ${token}` } });
            setBoards(prev => prev.filter(b => String(b.ID || b.id) !== String(boardId)));
            if (String(activeBoardId) === String(boardId)) navigate("/dashboard");
        } catch { alert("Failed to delete board."); }
    };

    // Delete document
    const handleDeleteDoc = async (e, docId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this document?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API}/docs/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
            setDocs(prev => prev.filter(d => String(d.ID || d.id) !== String(docId)));
            if (String(activeDocId) === String(docId)) navigate("/dashboard");
        } catch { alert("Failed to delete document."); }
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); localStorage.removeItem("userName"); localStorage.removeItem("userEmail");
        localStorage.removeItem("loginTime");
        navigate("/");
    };

    // ── AUTO SIGN-OUT AFTER 24 HOURS ──────────────────────
    useEffect(() => {
        const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

        const checkSession = () => {
            const loginTime = localStorage.getItem("loginTime");
            if (!loginTime) return;
            if (Date.now() - parseInt(loginTime, 10) >= SESSION_DURATION) {
                handleLogout();
            }
        };

        checkSession(); // check immediately on mount
        const interval = setInterval(checkSession, 60 * 1000); // check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 bg-[var(--bg)] text-[var(--text)]`}>

            {/* ── SIDEBAR ── */}
            <aside className={`w-[28%] min-w-[220px] max-w-[300px] h-full flex flex-col border-r transition-colors duration-300 bg-[var(--surface)] border-[var(--border)] shadow-xl z-20`}>

                {/* Logo */}
                <div className={`flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 border-[var(--border)]`}>
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img 
                        src="https://res.cloudinary.com/dxcygn064/image/upload/v1773517532/Untitled_design__1_-removebg-preview_h65kii.png" 
                        alt="Reecho Media" 
                        className="w-full h-full object-contain dark:invert transition-all duration-300 scale-300" 
                      />
                    </div>
                    <div>
                        <span className={`font-semibold text-xs tracking-tight text-[var(--text)] opacity-60`} style={{ fontFamily: 'serif' }}>CRM</span>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">

                    {/* ── BOARD & DOCUMENT BUTTON ── */}
                    <button
                        onClick={() => { setCurrentPage("boards"); navigate("/dashboard"); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 ${currentPage === "boards" && location.pathname === "/dashboard"
                            ? "bg-[var(--brand)] text-white shadow-md"
                            : "text-[var(--text)] hover:bg-[var(--text)]/5"}`}
                    >
                        <LayoutGrid size={14} className={currentPage === "boards" && location.pathname === "/dashboard" ? "text-white" : "text-[var(--brand)]"} />
                        Board &amp; Document
                    </button>

                    {/* ── QUICK CREATE (for admin + member) ── */}
                    {(userRole === "admin" || userRole === "member") && (
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setShowModal(true)}
                                title="New Board"
                                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                    isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                            >
                                <Plus size={11} /> Board
                            </button>
                            <button
                                onClick={handleCreateDoc}
                                title="New Document"
                                disabled={creatingDoc}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                    isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                            >
                                {creatingDoc ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />} Doc
                            </button>
                        </div>
                    )}

                    {/* ── AGENCY WORKSPACE ── */}
                    <div>
                        <div className={`text-[10px] font-semibold uppercase tracking-widest px-2 mt-4 mb-2 opacity-50 text-[var(--text)]`}>Agency Workspace</div>
                        {[
                            { page:"overview",  label:"Overview",         Icon:LayoutGrid, roles: ["admin", "member", "client"] },
                            { page:"tasks",     label:"Task Board",       Icon:CheckSquare, roles: ["admin", "member", "client"] },
                            { page:"calendar",  label:"Content Calendar", Icon:Calendar, roles: ["admin", "member", "client"] },
                            { page:"team",      label:"Team Members",     Icon:Users, roles: ["admin"]        },
                            { page:"clients",   label:"Clients",          Icon:Briefcase, roles: ["admin"]    },
                            { page:"payments",  label:"Payments",         Icon:CreditCard, roles: ["admin", "member", "client"] },
                            { page:"portal",    label:"Client Hub",       Icon:ExternalLink, roles: ["admin", "client"] },
                        ]
                        .filter(item => item.roles.includes(userRole))
                        .map(({ page, label, Icon }) => (
                            <button key={page}
                                onClick={() => { setCurrentPage(page); navigate("/dashboard"); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 ${currentPage === page && location.pathname === "/dashboard"
                                    ? "bg-[var(--brand)] text-white shadow-md"
                                    : "text-[var(--text)] hover:bg-[var(--text)]/5"}`}
                            >
                                <Icon size={14} className={currentPage === page && location.pathname === "/dashboard" ? "text-white" : "text-[var(--brand)]"} />
                                {label}
                            </button>
                        ))}
                    </div>

                </div>

                {/* ── FOOTER ── */}
                <div className={`border-t px-3 py-3 space-y-1 flex-shrink-0 border-[var(--border)]`}>
                    {/* Dark mode toggle */}
                    <button onClick={() => setIsDark(!isDark)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-[var(--text)] hover:bg-[var(--text)]/5`}>
                        <span className="flex items-center gap-2">
                            {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-[var(--brand)]" />}
                            {isDark ? "Light Mode" : "Dark Mode"}
                        </span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? "bg-[var(--brand)]" : "bg-[var(--border)]"}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                    </button>

                    {/* User */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-[var(--text)]/5`} onClick={() => navigate("/profile")}>
                        <div className="w-7 h-7 bg-[var(--brand)] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className={`text-xs font-semibold truncate text-[var(--text)]`}>{userName}</p>
                            <p className={`text-[10px] truncate opacity-50 text-[var(--text)]`}>{userEmail}</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors">
                        <LogOut size={13} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── CONTENT ── */}
            <main className="flex-1 h-full overflow-hidden relative bg-[var(--bg)]">
                {React.cloneElement(children, { isDark, setIsDark, boards, fetchBoards, docs, fetchDocs, handleCreateDoc, setShowModal, currentPage, setCurrentPage })}
            </main>

            {/* ── CREATE BOARD MODAL ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-[var(--text)]">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 border bg-[var(--surface)] border-[var(--border)]`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className={`text-xl font-semibold`} style={{ fontFamily: 'serif' }}>New Board</h2>
                                <button onClick={() => setShowModal(false)} className={`p-1 rounded-lg hover:bg-[var(--text)]/5 opacity-50`}><X size={18} /></button>
                            </div>
                            <p className={`text-sm mb-4 opacity-70`}>Give your board a name.</p>
                            <form onSubmit={handleCreate}>
                                <input autoFocus type="text" placeholder="e.g. Marketing Campaign" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                    className={`w-full p-3 rounded-xl border outline-none text-sm font-medium mb-4 bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--brand)]`} />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className={`flex-1 py-2.5 rounded-xl font-semibold border text-sm border-[var(--border)] text-[var(--text)] hover:bg-[var(--text)]/5`}>Cancel</button>
                                    <button type="submit" disabled={creating}
                                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-[var(--brand)] hover:opacity-90 text-white flex items-center justify-center gap-2 transition-all shadow-lg">
                                        {creating ? <Loader2 size={15} className="animate-spin" /> : null} Create Board
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── SHARE MODAL ── */}
            <ShareModal
                isOpen={!!shareTarget}
                onClose={() => setShareTarget(null)}
                resourceType={shareTarget?.type}
                resourceId={shareTarget?.id}
                isDark={isDark}
            />
        </div>
    );
};

export default AppLayout;
