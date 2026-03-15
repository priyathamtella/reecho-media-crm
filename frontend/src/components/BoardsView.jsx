import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Clock, LayoutGrid, Sparkles, FileText,
  Share2, CheckCircle, AlertCircle, Trash2, Users, ChevronDown, ChevronRight
} from "lucide-react";
import axios from "axios";
import ShareModal from "./ShareModal";

// Helper: normalize board/doc ID from GORM response (may be ID or id)
const getId = (item) => item?.id || item?.ID || "";

const API = "http://localhost:5050/api";

// ─── Pre-built template boards with DEMO content ─────────────────────────────
const TEMPLATES = [
  {
    id: "t1", title: "🎬 Video Edit Workflow",
    desc: "Complete visual plan for your next major client edit or YouTube video.",
    gradient: "from-fuchsia-500 to-rose-500", tags: ["Editing", "Workflow"],
    items: [
      { id: 1, type: "text", x: 80, y: 50, w: 500, h: 50, color: "#e11d48", text: "CLIENT X - 10MIN PROMO VIDEO", fontSize: 24, fontWeight: "bold", fontStyle: "normal", fontColor: "#e11d48", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "rect", x: 80, y: 130, w: 180, h: 80, color: "#4f46e5", text: "A-ROLL / DIALOGUE", fontSize: 13, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 3, type: "rect", x: 300, y: 130, w: 180, h: 80, color: "#0ea5e9", text: "B-ROLL & INSERTS", fontSize: 13, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 4, type: "rect", x: 520, y: 130, w: 180, h: 80, color: "#10b981", text: "COLOR & SOUND 🎵", fontSize: 13, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 5, type: "sticky", x: 80, y: 230, w: 180, h: 140, color: "#e9d5ff", text: "Timeline Notes:\n- Cut out umms\n- Multicam sync\n- Keep fast paced initially", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 30.5 },
      { id: 6, type: "sticky", x: 300, y: 230, w: 180, h: 140, color: "#bae6fd", text: "Assets Needed:\n- Office drone shot\n- Typing closeups\n- Team meeting montage", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 12.0, timelineDuration: 25.0 },
      { id: 7, type: "sticky", x: 520, y: 230, w: 180, h: 140, color: "#a7f3d0", text: "Audio:\n- Lofi background\n- Add swooshes to texts\n- EQ voiceover", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 45.0, timelineDuration: 15.0 },
    ],
    connections: [{ id: "c1", fromId: 2, toId: 3 }, { id: "c2", fromId: 3, toId: 4 }]
  },
  {
    id: "t2", title: "📱 Short-form Content",
    desc: "Plan 15s to 60s hooks, cuts, and text pop-ups for IG Reels or TikToks.",
    gradient: "from-violet-500 to-indigo-500", tags: ["TikTok", "Reels"],
    items: [
      { id: 1, type: "text", x: 60, y: 40, w: 500, h: 50, color: "#6366f1", text: "Reel: '3 Editing Tricks'", fontSize: 28, fontWeight: "bold", fontStyle: "normal", fontColor: "#6366f1", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "sticky", x: 60, y: 120, w: 180, h: 120, color: "#fef08a", text: "0-3s: THE HOOK\n'Stop editing your videos like a beginner... do this instead!'\n(Fast dynamic zoom in)", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 3.0 },
      { id: 3, type: "sticky", x: 260, y: 120, w: 180, h: 120, color: "#e9d5ff", text: "4-12s: TRICK 1\nJ-Cuts / L-Cuts\n(Show screen recording of Premiere timeline)", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 4.0, timelineDuration: 8.0 },
    ], connections: []
  },
  {
    id: "t3", title: "📅 Creator Calendar",
    desc: "Schedule and ideate your weekly video pipeline.",
    gradient: "from-cyan-500 to-blue-500", tags: ["Content", "Ideation"],
    items: [
      { id: 1, type: "text", x: 60, y: 30, w: 600, h: 50, color: "#0ea5e9", text: "WEEKLY VIDEO PIPELINE", fontSize: 22, fontWeight: "bold", fontStyle: "normal", fontColor: "#0ea5e9", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "rect", x: 60, y: 110, w: 160, h: 50, color: "#64748b", text: "Ideas Backlog", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
    ], connections: []
  },
];

// ─── Review status badge ─────────────────────────────────────────────────────
const ReviewBadge = ({ status, reviewerName, onApprove, isAdmin }) => {
  if (!status) return null;
  if (status === "in_review") return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
        <AlertCircle size={10} /> In Review {reviewerName ? `· ${reviewerName}` : ""}
      </span>
      {isAdmin && (
        <button
          onClick={onApprove}
          className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition-colors"
        >
          Approve ✓
        </button>
      )}
    </div>
  );
  if (status === "approved") return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
      <CheckCircle size={10} /> Approved
    </span>
  );
  return null;
};

// ─── Animated empty state ─────────────────────────────────────────────────────
const EmptyState = ({ isDark, onCreateBoard }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-6">
    <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center">
      <LayoutGrid size={40} className="text-indigo-400" />
    </div>
    <div className="text-center">
      <h3 className={`text-xl font-black mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>No boards yet!</h3>
      <p className={`text-sm mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Create one or pick a template below to get started.</p>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={onCreateBoard}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-colors text-sm">
        <Sparkles size={14} /> Create First Board
      </motion.button>
    </div>
  </div>
);

const BoardsView = ({ isDark = false, boards = [], docs = [], fetchBoards, fetchDocs, handleCreateDoc, setShowModal }) => {
  const navigate = useNavigate();
  const [creatingTemplate, setCreatingTemplate] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [collapsedMembers, setCollapsedMembers] = useState({});

  const userRole = localStorage.getItem("userRole") || "admin";
  const isAdmin = userRole === "admin";
  const currentUserId = localStorage.getItem("userId") || "";

  // Fetch team members (admin only) so we can group boards/docs by owner
  useEffect(() => {
    if (!isAdmin) return;
    const token = localStorage.getItem("token");
    axios.get(`${API}/members-list`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTeamMembers(res.data || []))
      .catch(() => {});
  }, [isAdmin]);

  // Build a map: memberEmail -> member info (for label lookup)
  const memberByEmail = {};
  teamMembers.forEach(m => { memberByEmail[m.email] = m; });

  // For admin: split boards into "mine" vs per-member buckets
  // For others: show all
  let displayBoards = boards;
  let memberBoardGroups = []; // [{ member, boards }]
  let displayDocs = docs;
  let memberDocGroups = [];   // [{ member, docs }]

  if (isAdmin) {
    // Admin's own boards (owned by currentUserId or no owner info)
    displayBoards = boards.filter(b => {
      const oid = b.OwnerID || b.owner_id || b.ownerId || "";
      return !oid || oid === currentUserId;
    });
    displayDocs = docs.filter(d => {
      const oid = d.OwnerID || d.owner_id || d.ownerId || "";
      return !oid || oid === currentUserId;
    });

    // Group remaining boards/docs by ownerEmail -> match against team members
    // We'll group by OwnerID; get member info from membersList
    const memberBoardMap = {};
    const memberDocMap = {};
    boards.forEach(b => {
      const oid = b.OwnerID || b.owner_id || b.ownerId || "";
      if (oid && oid !== currentUserId) {
        if (!memberBoardMap[oid]) memberBoardMap[oid] = [];
        memberBoardMap[oid].push(b);
      }
    });
    docs.forEach(d => {
      const oid = d.OwnerID || d.owner_id || d.ownerId || "";
      if (oid && oid !== currentUserId) {
        if (!memberDocMap[oid]) memberDocMap[oid] = [];
        memberDocMap[oid].push(d);
      }
    });

    // Build member groups (all unique ownerIDs found among boards + docs)
    const allMemberIds = new Set([...Object.keys(memberBoardMap), ...Object.keys(memberDocMap)]);
    allMemberIds.forEach(oid => {
      const knownMember = teamMembers.find(
        m => String(m.memberUserId) === oid || String(m.ID || m.id) === oid
      );
      memberBoardGroups.push({ ownerId: oid, member: knownMember, boards: memberBoardMap[oid] || [] });
      memberDocGroups.push({ ownerId: oid, member: knownMember, docs: memberDocMap[oid] || [] });
    });
  }

  const toggleMember = (oid) => setCollapsedMembers(prev => ({ ...prev, [oid]: !prev[oid] }));

  // Delete board
  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this board? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/boards/${boardId}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchBoards();
    } catch { alert("Failed to delete board."); }
  };

  // Delete doc
  const handleDeleteDoc = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/docs/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchDocs();
    } catch { alert("Failed to delete document."); }
  };

  // Create a board from a template
  const handleUseTemplate = async (template) => {
    setCreatingTemplate(template.id);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/boards`, { title: template.title }, { headers: { Authorization: `Bearer ${token}` } });
      const newId = getId(res.data);
      if (template.items?.length) {
        await axios.post(`${API}/boards/${newId}/sync`, {
          title: template.title,
          fullState: JSON.stringify({ items: template.items, connections: template.connections || [] })
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchBoards();
      navigate(`/boards/${newId}`);
    } catch {
      alert("Failed to create board from template.");
    } finally {
      setCreatingTemplate(null);
    }
  };

  // Approve a board review (admin only)
  const handleApproveBoard = async (e, boardId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    await axios.post(`${API}/boards/${boardId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
    await fetchBoards();
  };

  // Approve a doc review (admin only)
  const handleApproveDoc = async (e, docId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    await axios.post(`${API}/docs/${docId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
    await fetchDocs();
  };

  // Get normalized IDs and dates for display
  const getUpdatedAt = (item) => item?.updatedAt || item?.UpdatedAt || item?.updated_at || new Date().toISOString();

  // ── Reusable Board Card renderer ──
  const renderBoardCard = (board, i) => {
    const boardId = getId(board);
    const reviewStatus = board.reviewStatus || board.ReviewStatus || "";
    const reviewerName = board.reviewerName || board.ReviewerName || "";
    return (
      <motion.div key={boardId || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
        whileHover={{ y: -4, scale: 1.01 }} onClick={() => navigate(`/boards/${boardId}`)}
        className={`rounded-2xl p-5 border cursor-pointer transition-all shadow-sm hover:shadow-xl relative ${isDark ? "bg-slate-800 border-slate-700 hover:border-indigo-500" : "bg-white border-slate-200 hover:border-indigo-300"}`}>
        {reviewStatus === "in_review" && (
          <div className="absolute top-3 left-3 z-10"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow">⏳ Review</span></div>
        )}
        {reviewStatus === "approved" && (
          <div className="absolute top-3 left-3 z-10"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow">✓ Approved</span></div>
        )}
        <div className={`h-24 rounded-xl mb-4 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-slate-700 to-slate-600" : "bg-gradient-to-br from-slate-100 to-slate-200"}`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20"><LayoutGrid size={40} className="text-indigo-400" /></div>
        </div>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base truncate ${isDark ? "text-white" : "text-slate-800"}`}>{board.title || board.Title}</h3>
            <div className={`flex items-center gap-1 text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Clock size={11} /><span>{new Date(getUpdatedAt(board)).toLocaleDateString()}</span>
            </div>
            <div className="mt-2" onClick={e => e.stopPropagation()}>
              <ReviewBadge status={reviewStatus} reviewerName={reviewerName} isAdmin={isAdmin} onApprove={e => handleApproveBoard(e, boardId)} />
            </div>
          </div>
          <div className="flex gap-1 ml-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {isAdmin && (
              <button className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-slate-500 hover:bg-slate-700 hover:text-indigo-400" : "text-slate-300 hover:bg-indigo-50 hover:text-indigo-600"}`}
                title="Share" onClick={() => setShareTarget({ type: "board", id: boardId })}><Share2 size={15} /></button>
            )}
            {isAdmin && (
              <button className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-slate-500 hover:bg-rose-500/20 hover:text-rose-400" : "text-slate-300 hover:bg-rose-50 hover:text-rose-500"}`}
                title="Delete" onClick={e => handleDeleteBoard(e, boardId)}><Trash2 size={14} /></button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Reusable Doc Card renderer ──
  const renderDocCard = (doc, i) => {
    const docId = getId(doc);
    const docReviewStatus = doc.reviewStatus || doc.ReviewStatus || "";
    const docReviewerName = doc.reviewerName || doc.ReviewerName || "";
    return (
      <motion.div key={docId || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
        whileHover={{ y: -4, scale: 1.01 }} onClick={() => navigate(`/docs/${docId}`)}
        className={`rounded-2xl p-5 border cursor-pointer transition-all shadow-sm hover:shadow-xl relative ${isDark ? "bg-slate-800 border-slate-700 hover:border-emerald-500" : "bg-white border-slate-200 hover:border-emerald-300"}`}>
        {docReviewStatus === "in_review" && (
          <div className="absolute top-3 left-3 z-10"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow">⏳ Review</span></div>
        )}
        {docReviewStatus === "approved" && (
          <div className="absolute top-3 left-3 z-10"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow">✓ Approved</span></div>
        )}
        <div className={`h-24 rounded-xl mb-4 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-emerald-900 to-slate-800" : "bg-gradient-to-br from-emerald-50 to-slate-100"}`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20"><FileText size={40} className="text-emerald-500" /></div>
        </div>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base truncate ${isDark ? "text-white" : "text-slate-800"}`}>{doc.title || doc.Title}</h3>
            <div className={`flex items-center gap-1 text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Clock size={11} /><span>{new Date(getUpdatedAt(doc)).toLocaleDateString()}</span>
            </div>
            <div className="mt-2" onClick={e => e.stopPropagation()}>
              <ReviewBadge status={docReviewStatus} reviewerName={docReviewerName} isAdmin={isAdmin} onApprove={e => handleApproveDoc(e, docId)} />
            </div>
          </div>
          <div className="flex gap-1 ml-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {isAdmin && (
              <button className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-slate-500 hover:bg-slate-700 hover:text-emerald-400" : "text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"}`}
                title="Share" onClick={() => setShareTarget({ type: "doc", id: docId })}><Share2 size={15} /></button>
            )}
            {isAdmin && (
              <button className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-slate-500 hover:bg-rose-500/20 hover:text-rose-400" : "text-slate-300 hover:bg-rose-50 hover:text-rose-500"}`}
                title="Delete" onClick={e => handleDeleteDoc(e, docId)}><Trash2 size={14} /></button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-300 ${isDark ? "bg-slate-900 text-white" : "bg-[#F0F4F8] text-slate-900"}`}>

      {/* Top bar */}
      <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-white/60"} backdrop-blur-sm flex-shrink-0`}>
        <div>
          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            {isAdmin ? "My Workspace" : "My Boards & Docs"}
          </h1>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {displayBoards.length} board{displayBoards.length !== 1 ? "s" : ""} · {displayDocs.length} doc{displayDocs.length !== 1 ? "s" : ""}
            {isAdmin && memberBoardGroups.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? "bg-indigo-900/60 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
                + {memberBoardGroups.reduce((s, g) => s + g.boards.length, 0)} team boards
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {userRole !== "client" && (
            <>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-colors">
                <Plus size={16} /> New Board
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleCreateDoc}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-white"}`}>
                <FileText size={16} /> New Doc
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">

        {/* ── MY BOARDS ── */}
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {isAdmin ? "My Boards" : "Boards"}
          </h2>
          {displayBoards.length === 0 && !isAdmin ? (
            <EmptyState isDark={isDark} onCreateBoard={() => setShowModal(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {userRole !== "client" && (
                <motion.div whileHover={{ scale: 1.01, y: -2 }} onClick={() => setShowModal(true)}
                  className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center h-44 cursor-pointer transition-all ${isDark ? "border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/20" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDark ? "bg-slate-800 text-slate-400 group-hover:bg-indigo-900 group-hover:text-indigo-400" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`}><Plus size={24} /></div>
                  <p className={`font-bold text-sm ${isDark ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-500 group-hover:text-indigo-600"}`}>Create New Board</p>
                </motion.div>
              )}
              {displayBoards.map((board, i) => renderBoardCard(board, i))}
            </div>
          )}
        </section>

        {/* ── MY DOCUMENTS ── */}
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {isAdmin ? "My Documents" : "Documents"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {userRole !== "client" && (
              <motion.div whileHover={{ scale: 1.01, y: -2 }} onClick={handleCreateDoc}
                className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center h-44 cursor-pointer transition-all ${isDark ? "border-slate-700 hover:border-emerald-500 hover:bg-emerald-900/20" : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDark ? "bg-slate-800 text-slate-400 group-hover:bg-emerald-900 group-hover:text-emerald-400" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"}`}><FileText size={24} /></div>
                <p className={`font-bold text-sm ${isDark ? "text-slate-400 group-hover:text-emerald-400" : "text-slate-500 group-hover:text-emerald-600"}`}>Create New Document</p>
              </motion.div>
            )}
            {displayDocs.map((doc, i) => renderDocCard(doc, i))}
          </div>
        </section>

        {/* ── TEAM MEMBER SECTIONS (admin only) ── */}
        {isAdmin && memberBoardGroups.map(group => {
          const { ownerId, member, boards: mBoards } = group;
          const mDocsGroup = memberDocGroups.find(g => g.ownerId === ownerId) || { docs: [] };
          const memberName = member?.name || `Team Member`;
          const memberInitials = member?.initials || memberName.slice(0, 2).toUpperCase();
          const memberColor = member?.color || "#6366f1";
          const isCollapsed = collapsedMembers[ownerId];
          const totalItems = mBoards.length + mDocsGroup.docs.length;
          if (totalItems === 0) return null;
          return (
            <section key={ownerId}>
              {/* Section header with member info */}
              <button
                onClick={() => toggleMember(ownerId)}
                className={`w-full flex items-center gap-3 mb-4 group text-left`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: memberColor }}
                >
                  {memberInitials}
                </div>
                <div className="flex-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {memberName}'s Workspace
                  </span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? "bg-slate-700/80 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                    {mBoards.length} board{mBoards.length !== 1 ? "s" : ""} · {mDocsGroup.docs.length} doc{mDocsGroup.docs.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className={`transition-transform ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    {/* Member Boards */}
                    {mBoards.length > 0 && (
                      <>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-600" : "text-slate-300"}`}>Boards</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                          {mBoards.map((board, i) => renderBoardCard(board, i))}
                        </div>
                      </>
                    )}
                    {/* Member Docs */}
                    {mDocsGroup.docs.length > 0 && (
                      <>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-600" : "text-slate-300"}`}>Documents</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {mDocsGroup.docs.map((doc, i) => renderDocCard(doc, i))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className={`mt-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`} />
            </section>
          );
        })}

        {/* ── TEMPLATES (admin only) ── */}
        {isAdmin && (
          <section>
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Start from Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {TEMPLATES.map(t => (
                <motion.div key={t.id} whileHover={{ y: -4, scale: 1.01 }}
                  className={`rounded-2xl p-5 border cursor-pointer transition-all shadow-sm hover:shadow-xl ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                  <div className={`h-20 rounded-xl mb-4 bg-gradient-to-br ${t.gradient} flex items-center justify-center`}>
                    <span className="text-white font-black text-lg">{t.title.slice(0, 2)}</span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>{t.title}</h3>
                  <p className={`text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.desc}</p>
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {t.tags.map(tag => (
                      <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleUseTemplate(t)}
                    disabled={!!creatingTemplate}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60"
                  >
                    {creatingTemplate === t.id ? "Creating…" : "Use Template"}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Share Modal */}
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

export default BoardsView;