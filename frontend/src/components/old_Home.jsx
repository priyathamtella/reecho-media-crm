import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, MoreVertical, LayoutGrid, Sparkles, Zap, Copy } from "lucide-react";
import axios from "axios";

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
      { id: 4, type: "sticky", x: 460, y: 120, w: 180, h: 120, color: "#bae6fd", text: "13-22s: TRICK 2\nSound Design\n(Add whoosh/pop sound icons visually)", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 13.0, timelineDuration: 9.0 },
      { id: 5, type: "sticky", x: 260, y: 260, w: 180, h: 120, color: "#a7f3d0", text: "23-35s: TRICK 3\nColor Grade\n(Split screen before/after)", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 23.0, timelineDuration: 12.0 },
      { id: 6, type: "sticky", x: 460, y: 260, w: 180, h: 120, color: "#fca5a5", text: "35-40s: CTA\n'Follow for Part 2!'\n(Point at camera, text pops up)", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 35.0, timelineDuration: 5.0 },
    ], connections: [{ id: "c1", fromId: 2, toId: 3 }, { id: "c2", fromId: 3, toId: 4 }, { id: "c3", fromId: 4, toId: 5 }, { id: "c4", fromId: 5, toId: 6 }]
  },
  {
    id: "t3", title: "📅 Creator Calendar",
    desc: "Schedule and ideate your weekly video pipeline.",
    gradient: "from-cyan-500 to-blue-500", tags: ["Content", "Ideation"],
    items: [
      { id: 1, type: "text", x: 60, y: 30, w: 600, h: 50, color: "#0ea5e9", text: "WEEKLY VIDEO PIPELINE", fontSize: 22, fontWeight: "bold", fontStyle: "normal", fontColor: "#0ea5e9", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "rect", x: 60, y: 110, w: 160, h: 50, color: "#64748b", text: "Ideas Backlog", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 3, type: "rect", x: 250, y: 110, w: 160, h: 50, color: "#eab308", text: "Scripting", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 4, type: "rect", x: 440, y: 110, w: 160, h: 50, color: "#ef4444", text: "Filming", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 5, type: "rect", x: 630, y: 110, w: 160, h: 50, color: "#3b82f6", text: "Editing", fontSize: 12, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },

      { id: 6, type: "sticky", x: 60, y: 180, w: 160, h: 100, color: "#f1f5f9", text: "Desk Setup Tour\n(Need to buy new lights first)", fontSize: 11, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 7, type: "sticky", x: 60, y: 290, w: 160, h: 100, color: "#f1f5f9", text: "Day in the Life of an Editor", fontSize: 11, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },

      { id: 8, type: "sticky", x: 250, y: 180, w: 160, h: 100, color: "#fef08a", text: "Top 5 Premiere Plugins\n(Researching links)", fontSize: 11, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },

      { id: 9, type: "sticky", x: 440, y: 180, w: 160, h: 100, color: "#fecaca", text: "Macbook M3 Pro Review\n(Shoot B-roll today!)", fontSize: 11, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },

      { id: 10, type: "sticky", x: 630, y: 180, w: 160, h: 100, color: "#bfdbfe", text: "Vlog 04\n(Color grading right now)", fontSize: 11, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
    ], connections: [{ id: "c1", fromId: 2, toId: 3 }, { id: "c2", fromId: 3, toId: 4 }, { id: "c3", fromId: 4, toId: 5 }]
  },
  {
    id: "t4", title: "🚀 Product Roadmap",
    desc: "Visualize your product's journey with phases and milestones",
    gradient: "from-amber-500 to-orange-500", tags: ["Product", "Roadmap"],
    items: [
      { id: 1, type: "text", x: 80, y: 30, w: 700, h: 50, color: "#f59e0b", text: "PRODUCT ROADMAP 2026", fontSize: 24, fontWeight: "bold", fontStyle: "normal", fontColor: "#f59e0b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "rect", x: 80, y: 110, w: 150, h: 90, color: "#6366f1", text: "Q1\nFoundation", fontSize: 14, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 3, type: "rect", x: 280, y: 110, w: 150, h: 90, color: "#0ea5e9", text: "Q2\nGrowth", fontSize: 14, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 4, type: "rect", x: 480, y: 110, w: 150, h: 90, color: "#10b981", text: "Q3\nScale", fontSize: 14, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 5, type: "rect", x: 680, y: 110, w: 150, h: 90, color: "#f59e0b", text: "Q4\nOptimize 🎯", fontSize: 14, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 6, type: "sticky", x: 80, y: 240, w: 150, h: 130, color: "#e9d5ff", text: "• Auth system\n• Core API\n• Dashboard MVP", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 7, type: "sticky", x: 280, y: 240, w: 150, h: 130, color: "#dbeafe", text: "• User onboarding\n• Analytics\n• Mobile app", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 8, type: "sticky", x: 480, y: 240, w: 150, h: 130, color: "#dcfce7", text: "• Integrations\n• Team features\n• Enterprise tier", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 9, type: "sticky", x: 680, y: 240, w: 150, h: 130, color: "#fef9c3", text: "• Performance\n• AI features\n• Marketplace", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
    ],
    connections: [{ id: "c1", fromId: 2, toId: 3 }, { id: "c2", fromId: 3, toId: 4 }, { id: "c3", fromId: 4, toId: 5 }]
  },
  {
    id: "t5", title: "💡 Brainstorm Board",
    desc: "Free-flow idea capture with sticky notes and mind map connections",
    gradient: "from-emerald-500 to-teal-500", tags: ["Ideas", "Creative"],
    items: [
      { id: 1, type: "circle", x: 250, y: 150, w: 140, h: 140, color: "#6366f1", text: "💡 Big Idea", fontSize: 18, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "sticky", x: 60, y: 50, w: 150, h: 100, color: "#fef08a", text: "🎯 Target Audience\nMillennials 25-35", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 3, type: "sticky", x: 460, y: 50, w: 150, h: 100, color: "#bbf7d0", text: "💰 Revenue Model\nSubscription SaaS", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 4, type: "sticky", x: 60, y: 280, w: 150, h: 100, color: "#bfdbfe", text: "⚡ Key Features\nAI-first workflow", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 5, type: "sticky", x: 460, y: 280, w: 150, h: 100, color: "#fecdd3", text: "🚀 MVP Timeline\n3 months sprint", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 6, type: "sticky", x: 180, y: 350, w: 280, h: 70, color: "#e9d5ff", text: "📝 Next Steps: Research competitors, sketch wireframes, validate with 10 users", fontSize: 11, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
    ],
    connections: [{ id: "c1", fromId: 1, toId: 2 }, { id: "c2", fromId: 1, toId: 3 }, { id: "c3", fromId: 1, toId: 4 }, { id: "c4", fromId: 1, toId: 5 }]
  },
  {
    id: "t6", title: "📊 Client Report",
    desc: "Present performance metrics and insights to clients beautifully",
    gradient: "from-slate-600 to-slate-800", tags: ["Reports", "Analytics"],
    items: [
      { id: 1, type: "rect", x: 60, y: 30, w: 620, h: 80, color: "#0f172a", text: "QUARTERLY PERFORMANCE REPORT", fontSize: 20, fontWeight: "bold", fontStyle: "normal", fontColor: "#f8fafc", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 2, type: "rect", x: 60, y: 150, w: 140, h: 100, color: "#6366f1", text: "↑ 42%\nConversions", fontSize: 16, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 3, type: "rect", x: 230, y: 150, w: 140, h: 100, color: "#10b981", text: "↑ 18%\nRevenue", fontSize: 16, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 4, type: "rect", x: 400, y: 150, w: 140, h: 100, color: "#f59e0b", text: "↓ 5%\nChurn Rate", fontSize: 16, fontWeight: "bold", fontStyle: "normal", fontColor: "#fff", thickness: 3, timelineStart: 0, timelineDuration: 5 },
      { id: 5, type: "sticky", x: 60, y: 290, w: 300, h: 140, color: "#f1f5f9", text: "📈 Highlights\n✅ Record month in March\n✅ 3 new enterprise clients\n✅ NPS score: 72 (excellent)", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
      { id: 6, type: "sticky", x: 390, y: 290, w: 290, h: 140, color: "#fef3c7", text: "🎯 Next Quarter Goals\n→ Expand to EU market\n→ Launch referral program\n→ Hire 3 account managers", fontSize: 12, fontWeight: "normal", fontStyle: "normal", fontColor: "#1e293b", thickness: 4, timelineStart: 0, timelineDuration: 5 },
    ], connections: []
  },
];

// ─── Animated empty state ───────────────────────────────────────────────────
const EmptyState = ({ isDark, onCreateBoard }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1, opacity: 1,
      transition: { pathLength: { delay: i * 0.4, type: "spring", duration: 2, bounce: 0 }, opacity: { delay: i * 0.4, duration: 0.1 } },
    }),
  };
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative w-48 h-48">
        <motion.div className="absolute top-0 left-0 text-amber-400 w-16 h-16" animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={0.5} variants={draw} initial="hidden" animate="visible" d="M9 18h6" />
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M10 22h4" />
            <motion.path custom={1.5} variants={draw} initial="hidden" animate="visible" d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.79 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
          </motion.svg>
        </motion.div>
        <motion.div className="absolute bottom-0 right-0 text-emerald-400 w-16 h-16" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M3 3v18h18" />
            <motion.path custom={1.5} variants={draw} initial="hidden" animate="visible" d="M18 17V9" />
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M13 17V5" />
            <motion.path custom={2.5} variants={draw} initial="hidden" animate="visible" d="M8 17v-3" />
          </motion.svg>
        </motion.div>
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 w-20 h-20" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 6, repeat: Infinity }}>
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.circle custom={1} variants={draw} initial="hidden" animate="visible" cx="12" cy="12" r="10" />
            <motion.circle custom={2} variants={draw} initial="hidden" animate="visible" cx="12" cy="12" r="5" />
            <motion.circle custom={3} variants={draw} initial="hidden" animate="visible" cx="12" cy="12" r="1" />
          </motion.svg>
        </motion.div>
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
};

const Home = ({ isDark = false, boards = [], fetchBoards, setShowModal }) => {
  const navigate = useNavigate();
  const [creatingTemplate, setCreatingTemplate] = useState(null);

  // Create a board from a template
  const handleUseTemplate = async (template) => {
    setCreatingTemplate(template.id);
    try {
      const token = localStorage.getItem("token");
      // 1. Create the board
      const res = await axios.post(
        "http://localhost:5050/api/boards",
        { title: template.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 2. Immediately sync the demo items into the board
      if (template.items?.length) {
        await axios.post(
          `http://localhost:5050/api/boards/${res.data.ID}/sync`,
          {
            Title: template.title,
            fullState: JSON.stringify({ items: template.items, connections: template.connections || [] })
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchBoards();
      navigate(`/boards/${res.data.ID}`);
    } catch {
      alert("Failed to create board from template.");
    } finally {
      setCreatingTemplate(null);
    }
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-300 ${isDark ? "bg-slate-900 text-white" : "bg-[#F0F4F8] text-slate-900"}`}>

      {/* Top bar */}
      <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-white/60"} backdrop-blur-sm flex-shrink-0`}>
        <div>
          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>My Boards</h1>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {boards.length} board{boards.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-colors">
          <Plus size={16} /> New Board
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">

        {/* ── USER'S OWN BOARDS ── */}
        {boards.length === 0 ? (
          <EmptyState isDark={isDark} onCreateBoard={() => setShowModal(true)} />
        ) : (
          <section>
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Your Boards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* Create New Card */}
              <motion.div whileHover={{ scale: 1.01, y: -2 }} onClick={() => setShowModal(true)}
                className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center h-44 cursor-pointer transition-all ${isDark ? "border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/20" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDark ? "bg-slate-800 text-slate-400 group-hover:bg-indigo-900 group-hover:text-indigo-400" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`}>
                  <Plus size={24} />
                </div>
                <p className={`font-bold text-sm ${isDark ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-500 group-hover:text-indigo-600"}`}>Create New Board</p>
              </motion.div>

              {boards.map((board, i) => (
                <motion.div key={board.ID} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.01 }} onClick={() => navigate(`/boards/${board.ID}`)}
                  className={`rounded-2xl p-5 border cursor-pointer transition-all shadow-sm hover:shadow-xl ${isDark ? "bg-slate-800 border-slate-700 hover:border-indigo-500" : "bg-white border-slate-200 hover:border-indigo-300"}`}>
                  <div className={`h-24 rounded-xl mb-4 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-slate-700 to-slate-600" : "bg-gradient-to-br from-slate-100 to-slate-200"}`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <LayoutGrid size={40} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-base truncate w-36 ${isDark ? "text-white" : "text-slate-800"}`}>{board.Title}</h3>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        <Clock size={11} />
                        <span>{new Date(board.UpdatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className={`p-1 rounded ${isDark ? "text-slate-500" : "text-slate-300"}`} onClick={e => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── TEMPLATE BOARDS ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-indigo-500" />
            <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Start from a Template</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TEMPLATES.map((template, i) => (
              <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className={`rounded-2xl overflow-hidden border cursor-pointer group transition-all shadow-sm hover:shadow-xl ${isDark ? "border-slate-700 hover:border-indigo-500/50" : "border-slate-200 hover:border-indigo-300"}`}
              >
                {/* Gradient header */}
                <div className={`h-20 bg-gradient-to-br ${template.gradient} relative flex items-end px-4 pb-3`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  <div className="flex gap-1.5 relative z-10">
                    {template.tags.map(tag => (
                      <span key={tag} className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className={`p-4 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>{template.title}</h3>
                  <p className={`text-xs mb-3 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{template.desc}</p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleUseTemplate(template)}
                    disabled={creatingTemplate === template.id}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${isDark ? "border-slate-600 text-slate-300 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white" : "border-slate-200 text-slate-600 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"}`}
                  >
                    {creatingTemplate === template.id ? (
                      <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Creating...</>
                    ) : (
                      <><Copy size={11} /> Use Template</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;