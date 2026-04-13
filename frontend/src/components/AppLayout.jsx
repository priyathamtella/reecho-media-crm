import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LayoutGrid, Plus, LogOut, Sun, Moon,
  Loader2, X, FileText, CheckSquare, Calendar,
  Users, Briefcase, CreditCard, ExternalLink, Menu
} from "lucide-react";
import ShareModal from "./ShareModal";
import { API } from "../api";

const NAV_ITEMS = [
  { page: "overview",  label: "Overview",         Icon: LayoutGrid,   roles: ["admin","member","client"] },
  { page: "tasks",     label: "Task Board",        Icon: CheckSquare,  roles: ["admin","member","client"] },
  { page: "calendar",  label: "Content Calendar",  Icon: Calendar,     roles: ["admin","member","client"] },
  { page: "team",      label: "Team Members",      Icon: Users,        roles: ["admin"]                   },
  { page: "clients",   label: "Clients",           Icon: Briefcase,    roles: ["admin"]                   },
  { page: "payments",  label: "Payments",          Icon: CreditCard,   roles: ["admin","member","client"] },
  { page: "portal",    label: "Client Hub",        Icon: ExternalLink, roles: ["admin","client"]          },
];

const AppLayout = ({ children }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [boards, setBoards]       = useState([]);
  const [docs,   setDocs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isDark, setIsDark]       = useState(() => localStorage.getItem("theme") === "dark");
  const [showModal,   setShowModal]   = useState(false);
  const [newTitle,    setNewTitle]    = useState("");
  const [creating,    setCreating]    = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  const userName = localStorage.getItem("userName")  || "User";
  const userEmail= localStorage.getItem("userEmail") || "";
  const userRole = localStorage.getItem("userRole")  || "admin";
  const [currentPage, setCurrentPage] = useState(userRole === "client" ? "portal" : "overview");

  // Dark mode
  useEffect(() => {
    if (isDark) { document.documentElement.classList.add("dark"); localStorage.setItem("theme","dark"); }
    else        { document.documentElement.classList.remove("dark"); localStorage.setItem("theme","light"); }
  }, [isDark]);

  const activeBoardId = location.pathname.startsWith("/boards/") ? location.pathname.split("/boards/")[1] : null;
  const activeDocId   = location.pathname.startsWith("/docs/")   ? location.pathname.split("/docs/")[1]   : null;

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
    } catch {}
  };

  useEffect(() => { fetchBoards(); fetchDocs(); }, [location.pathname]);

  // 24-hour session auto-logout
  useEffect(() => {
    const SESSION = 24 * 60 * 60 * 1000;
    const check = () => {
      const t = localStorage.getItem("loginTime");
      if (t && Date.now() - parseInt(t, 10) >= SESSION) handleLogout();
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

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

  const handleCreateDoc = async () => {
    setCreatingDoc(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/docs`, { title: "Untitled Document" }, { headers: { Authorization: `Bearer ${token}` } });
      // Backend (sqlx) returns lowercase "id" field
      const newId = res.data?.id || res.data?.ID;
      if (!newId) throw new Error("Server returned document without an id");
      setDocs(prev => [res.data, ...prev]);
      navigate(`/docs/${newId}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to create document.";
      alert(msg);
    }
    finally { setCreatingDoc(false); }
  };


  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this board? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/boards/${boardId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBoards(prev => prev.filter(b => String(b.id || b.ID) !== String(boardId)));
      if (String(activeBoardId) === String(boardId)) navigate("/dashboard");
    } catch { alert("Failed to delete board."); }
  };

  const handleDeleteDoc = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/docs/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
      setDocs(prev => prev.filter(d => String(d.id || d.ID) !== String(docId)));
      if (String(activeDocId) === String(docId)) navigate("/dashboard");
    } catch { alert("Failed to delete document."); }
  };

  const handleLogout = () => {
    ["token","userName","userEmail","loginTime","userRole","userId"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  const navigate2 = (page) => {
    setCurrentPage(page);
    navigate("/dashboard");
    setSidebarOpen(false); // close drawer on mobile after navigation
  };

  // ── Sidebar contents (shared between desktop and mobile drawer) ──
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dxcygn064/image/upload/v1773517532/Untitled_design__1_-removebg-preview_h65kii.png"
            alt="Reecho Media"
            className="w-full h-full object-contain"
            style={{ filter: isDark ? "invert(1)" : "none" }}
          />
        </div>
        <span className="font-semibold text-xs tracking-tight text-[var(--text)] opacity-60" style={{ fontFamily: "serif" }}>CRM</span>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {/* Board & Docs button */}
        <button
          onClick={() => navigate2("boards")}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 ${
            currentPage === "boards" && location.pathname === "/dashboard"
              ? "bg-[var(--brand)] text-white shadow-md"
              : "text-[var(--text)] hover:bg-[var(--text)]/5"
          }`}
        >
          <LayoutGrid size={14} className={currentPage === "boards" && location.pathname === "/dashboard" ? "text-white" : "text-[var(--brand)]"} />
          Board &amp; Document
        </button>

        {/* Quick-create */}
        {(userRole === "admin" || userRole === "member") && (
          <div className="flex gap-1.5">
            <button
              onClick={() => { setShowModal(true); setSidebarOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Plus size={11} /> Board
            </button>
            <button
              onClick={() => { handleCreateDoc(); setSidebarOpen(false); }}
              disabled={creatingDoc}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {creatingDoc ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />} Doc
            </button>
          </div>
        )}

        {/* Agency nav items */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest px-2 mt-4 mb-2 opacity-50 text-[var(--text)]">Agency Workspace</div>
          {NAV_ITEMS.filter(i => i.roles.includes(userRole)).map(({ page, label, Icon }) => (
            <button
              key={page}
              onClick={() => navigate2(page)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 ${
                currentPage === page && location.pathname === "/dashboard"
                  ? "bg-[var(--brand)] text-white shadow-md"
                  : "text-[var(--text)] hover:bg-[var(--text)]/5"
              }`}
            >
              <Icon size={14} className={currentPage === page && location.pathname === "/dashboard" ? "text-white" : "text-[var(--brand)]"} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-1 flex-shrink-0 border-[var(--border)]">
        {/* Dark mode */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-[var(--text)] hover:bg-[var(--text)]/5"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-[var(--brand)]" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? "bg-[var(--brand)]" : "bg-[var(--border)]"}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
        </button>

        {/* User */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-[var(--text)]/5"
          onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
        >
          <div className="w-7 h-7 bg-[var(--brand)] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate text-[var(--text)]">{userName}</p>
            <p className="text-[10px] truncate opacity-50 text-[var(--text)]">{userEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-[240px] lg:w-[260px] shrink-0 h-full flex-col border-r bg-[var(--surface)] border-[var(--border)] shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* ── MOBILE HAMBURGER BUTTON ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-[110] p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} className="text-[var(--text)]" />
      </button>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-[100]"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="md:hidden fixed top-0 left-0 h-full w-[260px] z-[110] flex flex-col bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl"
            >
              <button className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--text)]/10" onClick={() => setSidebarOpen(false)}>
                <X size={18} className="text-[var(--text)]" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 h-full overflow-hidden relative bg-[var(--bg)] min-w-0">
        {React.cloneElement(children, {
          isDark, setIsDark, boards, fetchBoards, docs, fetchDocs,
          handleCreateDoc, setShowModal, currentPage, setCurrentPage
        })}
      </main>

      {/* ── CREATE BOARD MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="w-full max-w-sm rounded-2xl shadow-2xl p-6 border bg-[var(--surface)] border-[var(--border)]"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: "serif" }}>New Board</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-[var(--text)]/5 opacity-50"><X size={18} /></button>
              </div>
              <p className="text-sm mb-4 opacity-70 text-[var(--text)]">Give your board a name.</p>
              <form onSubmit={handleCreate}>
                <input
                  autoFocus type="text" placeholder="e.g. Marketing Campaign"
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border outline-none text-sm font-medium mb-4 bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--brand)]"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-semibold border text-sm border-[var(--border)] text-[var(--text)] hover:bg-[var(--text)]/5">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-[var(--brand)] hover:opacity-90 text-white flex items-center justify-center gap-2 shadow-lg">
                    {creating ? <Loader2 size={15} className="animate-spin" /> : null} Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
