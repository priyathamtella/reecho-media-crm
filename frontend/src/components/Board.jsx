import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type, Square, Circle, Minus, MoveRight, Video,
  Trash2, Image as ImageIcon, CloudUpload, Loader2,
  Sun, Moon, Projector, X, PenTool, MousePointer2, Eraser,
  Upload, Link, Cloud, StickyNote, Smile, ZoomIn, ZoomOut,
  Play, Pause, Film, ChevronDown, ChevronUp, Edit3, Check
} from "lucide-react";

// ─────────────────────────────────────────────
//  EMOJI STICKERS
// ─────────────────────────────────────────────
const EMOJIS = ["🎯", "🚀", "💡", "⭐", "🔥", "✅", "❌", "📌", "📎", "🎨", "💬", "👍", "🤔", "🎉", "⚡", "🛠️"];

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // --- REFS ---
  const itemsRef = useRef([]);
  const titleRef = useRef("Untitled Board");

  // --- STATE ---
  const [boardTitle, setBoardTitle] = useState("Loading...");
  const [editingTitle, setEditingTitle] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI State
  const [tool, setTool] = useState("select");
  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState(null);

  // Drawing State
  const [penColor, setPenColor] = useState("#6366f1");
  const [penThickness, setPenThickness] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  const [zoom, setZoom] = useState(1);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [bgType, setBgType] = useState("dots");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [presentationMode, setPresentationMode] = useState(false);

  // Media modal
  const [mediaModal, setMediaModal] = useState(null); // null | 'image' | 'video'
  const [mediaTab, setMediaTab] = useState("device"); // device | url | cloud
  const [mediaUrl, setMediaUrl] = useState("");
  const fileInputRef = useRef(null);

  // Emoji panel
  const [showEmoji, setShowEmoji] = useState(false);

  // Timeline
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelinePlayhead, setTimelinePlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef(null);

  const CANVAS_SIZE = 4000;
  const TOTAL_DURATION = 60; // seconds (timeline = 60s default)

  // ── 1. PARSER ──────────────────────────────
  const parseBoardData = (fullState) => {
    if (!fullState) return [];
    if (typeof fullState === "object") return fullState.items || [];
    if (typeof fullState === "string") {
      try {
        const parsed = JSON.parse(fullState);
        if (typeof parsed === "string") return parseBoardData(parsed);
        return parsed.items || [];
      } catch (e) { return []; }
    }
    return [];
  };

  // ── 2. SYNC ─────────────────────────────────
  useEffect(() => {
    itemsRef.current = items;
    titleRef.current = boardTitle;
  }, [items, boardTitle]);

  const saveToBackend = useCallback(async () => {
    if (!isLoaded) return;
    const token = localStorage.getItem("token");
    setSaveStatus("saving");
    try {
      await axios.post(`http://localhost:5050/api/boards/${id}/sync`,
        { Title: titleRef.current, fullState: JSON.stringify({ items: itemsRef.current }) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch { setSaveStatus("error"); }
  }, [id, isLoaded]);

  // ── 3. FETCH ─────────────────────────────────
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5050/api/boards/${id}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBoardTitle(res.data.Title || "Untitled Board");
        const loadedItems = parseBoardData(res.data.fullState);
        setItems(loadedItems);
        itemsRef.current = loadedItems;
        setIsLoaded(true);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      }
    };
    fetchBoard();
  }, [id, navigate]);

  // ── 4. TIMELINE PLAYHEAD ─────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelinePlayhead(prev => {
        if (prev >= TOTAL_DURATION) { setIsPlaying(false); return 0; }
        return prev + 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // ── 5. CANVAS RENDERING ──────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const strokeColor = darkMode ? "#a5b4fc" : "#6366f1";

    items.forEach((item) => {
      if (item.type === "text" || item.type === "image" || item.type === "video" || item.type === "sticky" || item.type === "emoji") return;

      ctx.save();
      ctx.lineWidth = item.thickness || 3;
      const drawColor = (item.color === "#6366f1") ? strokeColor : item.color;
      ctx.strokeStyle = drawColor;
      ctx.fillStyle = drawColor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      if (item.type === "drawing") {
        if (item.points && item.points.length > 0) {
          ctx.moveTo(item.points[0].x, item.points[0].y);
          item.points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
      } else if (item.type === "rect") {
        // Full solid color fill
        ctx.roundRect(item.x, item.y, item.w, item.h, 10);
        ctx.fill();
        ctx.strokeStyle = darkMode ? "#818cf8" : "#4f46e5";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (item.type === "circle") {
        // Full solid color fill
        ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = darkMode ? "#818cf8" : "#4f46e5";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (item.type === "line") {
        ctx.moveTo(item.x, item.y + item.h / 2);
        ctx.lineTo(item.x + item.w, item.y + item.h / 2);
        ctx.stroke();
      } else if (item.type === "arrow") {
        const midY = item.y + item.h / 2;
        ctx.moveTo(item.x, midY); ctx.lineTo(item.x + item.w, midY); ctx.stroke();
        const headLen = (item.thickness || 3) * 4;
        ctx.beginPath();
        ctx.moveTo(item.x + item.w, midY);
        ctx.lineTo(item.x + item.w - headLen, midY - headLen * 0.6);
        ctx.lineTo(item.x + item.w - headLen, midY + headLen * 0.6);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    });

    // Active drawing stroke
    if (isDrawing && currentPath.length > 0) {
      ctx.save();
      ctx.lineWidth = penThickness;
      ctx.strokeStyle = penColor;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    }
  }, [items, darkMode, isDrawing, currentPath, penColor, penThickness]);

  // ── 6. INTERACTIONS ──────────────────────────
  const isPointNearLine = (px, py, p1, p2) => {
    const dist = Math.abs((p2.y - p1.y) * px - (p2.x - p1.x) * py + p2.x * p1.y - p2.y * p1.x) /
      Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
    return dist < 10;
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const mx = e.pageX / zoom;
    const my = e.pageY / zoom;
    if (tool === "draw") { setIsDrawing(true); setCurrentPath([{ x: mx, y: my }]); return; }
    if (tool === "eraser") {
      setIsDrawing(true);
      const remaining = items.filter(item => {
        if (item.type !== "drawing") return true;
        const xs = item.points.map(p => p.x);
        const ys = item.points.map(p => p.y);
        return !(mx >= Math.min(...xs) - 10 && mx <= Math.max(...xs) + 10 && my >= Math.min(...ys) - 10 && my <= Math.max(...ys) + 10);
      });
      if (remaining.length !== items.length) { setItems(remaining); itemsRef.current = remaining; }
      return;
    }
    setSelectedId(null); setEditingId(null);
  };

  const handleMouseMove = (e) => {
    const mx = e.pageX / zoom;
    const my = e.pageY / zoom;
    if (isDrawing && tool === "draw") { setCurrentPath(prev => [...prev, { x: mx, y: my }]); return; }
    if (isDrawing && tool === "eraser") {
      const remaining = items.filter(item => {
        if (item.type !== "drawing") return true;
        for (let i = 0; i < item.points.length - 1; i++) {
          if (isPointNearLine(mx, my, item.points[i], item.points[i + 1])) return false;
        }
        return true;
      });
      if (remaining.length !== items.length) { setItems(remaining); itemsRef.current = remaining; }
      return;
    }
    if (draggingId) {
      setItems(items.map(i => i.id === draggingId ? { ...i, x: mx - offset.x, y: my - offset.y } : i));
    } else if (resizing) {
      const { id: rid, handle } = resizing;
      setItems(items.map(i => {
        if (i.id !== rid) return i;
        let { x, y, w, h } = i;
        if (handle.includes("right")) w = Math.max(20, mx - x);
        if (handle.includes("bottom")) h = Math.max(20, my - y);
        if (handle.includes("left")) { const dw = mx - x; w -= dw; x = mx; }
        if (handle.includes("top")) { const dh = my - y; h -= dh; y = my; }
        return { ...i, x, y, w, h };
      }));
    }
  };

  const handleMouseUp = () => {
    if (tool === "draw" && isDrawing) {
      setIsDrawing(false);
      if (currentPath.length > 1) {
        const nd = { id: Date.now(), type: "drawing", points: currentPath, color: penColor, thickness: penThickness, x: 0, y: 0, w: 0, h: 0 };
        const ni = [...items, nd];
        setItems(ni); itemsRef.current = ni;
      }
      setCurrentPath([]);
    } else if (tool === "eraser") {
      setIsDrawing(false);
    } else {
      setDraggingId(null); setResizing(null);
    }
  };

  const handleItemMouseDown = (e, item) => {
    if (tool === "draw" || tool === "eraser") return;
    e.stopPropagation();
    if (e.button === 0 && editingId !== item.id) {
      setDraggingId(item.id); setSelectedId(item.id);
      setOffset({ x: e.pageX / zoom - item.x, y: e.pageY / zoom - item.y });
    }
  };

  // ── 7. ADD ITEM ───────────────────────────────
  const addItem = (type, src = "") => {
    setTool("select");
    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;
    const cx = (scrollX + window.innerWidth * 0.35) / zoom;
    const cy = (scrollY + window.innerHeight / 2) / zoom;

    const defaults = {
      text: { w: 240, h: 120 },
      rect: { w: 160, h: 120 },
      circle: { w: 130, h: 130 },
      image: { w: 300, h: 200 },
      video: { w: 420, h: 260 },
      sticky: { w: 200, h: 160 },
      emoji: { w: 80, h: 80 },
      line: { w: 200, h: 40 },
      arrow: { w: 200, h: 40 },
    };
    const { w, h } = defaults[type] || { w: 150, h: 150 };

    // sticky note colors
    const stickyColors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecdd3", "#e9d5ff"];
    const stickyColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];

    const newItem = {
      id: Date.now(), type,
      x: cx - w / 2, y: cy - h / 2, w, h,
      color: type === "sticky" ? stickyColor : "#6366f1",
      text: type === "sticky" ? "📝 Note..." : type === "emoji" ? "⭐" : "",
      src,
      fontSize: type === "sticky" ? 14 : 16,
      fontWeight: "normal", fontStyle: "normal",
      fontColor: type === "sticky" ? "#1e293b" : (darkMode ? "#f8fafc" : "#1e293b"),
      thickness: 4,
      // Video timeline properties
      timelineStart: 0, timelineDuration: 5,
    };
    const ni = [...items, newItem];
    setItems(ni); itemsRef.current = ni;
  };

  const updateItem = (id, fields) => {
    setItems(items.map(i => i.id === id ? { ...i, ...fields } : i));
  };

  // ── 8. MEDIA IMPORT ───────────────────────────
  const openMediaModal = (type) => {
    setMediaModal(type); setMediaTab("device"); setMediaUrl("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    addItem(isVideo ? "video" : "image", url);
    setMediaModal(null);
    e.target.value = "";
  };

  const handleUrlImport = () => {
    if (!mediaUrl.trim()) return;
    addItem(mediaModal, mediaUrl.trim());
    setMediaModal(null); setMediaUrl("");
  };

  // ── 9. TIMELINE DRAG ──────────────────────────
  const handleTimelineDrag = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setTimelinePlayhead(ratio * TOTAL_DURATION);
  };

  const videoItems = items.filter(i => i.type === "video");

  if (!isLoaded) return (
    <div className="h-full w-full flex items-center justify-center bg-[#F0F4F8] dark:bg-slate-900 text-slate-400 gap-2">
      <Loader2 className="animate-spin" /> Loading Board...
    </div>
  );

  const dm = darkMode;

  return (
    <div className={`h-full w-full overflow-hidden relative font-sans flex flex-col transition-colors duration-300 ${dm ? "bg-slate-900 text-white" : "bg-[#F0F4F8] text-slate-900"}`}>

      {/* ── PRESENTATION EXIT ── */}
      {presentationMode && (
        <button onClick={() => setPresentationMode(false)} className="fixed top-6 right-6 z-[60] bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md">
          <X size={24} />
        </button>
      )}

      {/* ── FLOATING TOOLBAR ── */}
      <AnimatePresence>
        {!presentationMode && (
          <motion.nav
            initial={{ y: -80 }} animate={{ y: 0 }} exit={{ y: -80 }}
            className={`absolute top-4 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-2xl shadow-xl border z-50 ${dm ? "bg-slate-800/95 border-slate-700" : "bg-white/95 border-slate-200"}`}
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* Board title inline edit */}
            {editingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className={`text-sm font-bold outline-none bg-transparent border-b ${dm ? "border-indigo-400 text-white" : "border-indigo-500 text-slate-800"}`}
                  value={boardTitle}
                  onChange={e => setBoardTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                  style={{ width: Math.max(80, boardTitle.length * 8) }}
                />
                <button onClick={() => setEditingTitle(false)} className="text-emerald-500 p-0.5"><Check size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setEditingTitle(true)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${dm ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <Edit3 size={12} /> {boardTitle.slice(0, 18)}{boardTitle.length > 18 ? "…" : ""}
              </button>
            )}

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            {/* TOOLS */}
            <div className={`flex p-0.5 rounded-xl ${dm ? "bg-slate-700/60" : "bg-slate-100"}`}>
              <ToolBtn icon={<MousePointer2 size={16} />} onClick={() => setTool("select")} label="Select" active={tool === "select"} dark={dm} />
              <ToolBtn icon={<PenTool size={16} />} onClick={() => setTool("draw")} label="Draw" active={tool === "draw"} dark={dm} />
              <ToolBtn icon={<Eraser size={16} />} onClick={() => setTool("eraser")} label="Eraser" active={tool === "eraser"} dark={dm} activeColor="text-rose-500" />
            </div>

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            {/* SHAPES & ELEMENTS */}
            <ToolBtn icon={<Type size={16} />} onClick={() => addItem("text")} label="Text" dark={dm} />
            <ToolBtn icon={<Square size={16} />} onClick={() => addItem("rect")} label="Rectangle" dark={dm} />
            <ToolBtn icon={<Circle size={16} />} onClick={() => addItem("circle")} label="Circle" dark={dm} />
            <ToolBtn icon={<Minus size={16} />} onClick={() => addItem("line")} label="Line" dark={dm} />
            <ToolBtn icon={<MoveRight size={16} />} onClick={() => addItem("arrow")} label="Arrow" dark={dm} />
            <ToolBtn icon={<StickyNote size={16} />} onClick={() => addItem("sticky")} label="Sticky Note" dark={dm} />

            {/* EMOJI */}
            <div className="relative">
              <ToolBtn icon={<Smile size={16} />} onClick={() => setShowEmoji(!showEmoji)} label="Emoji" dark={dm} active={showEmoji} />
              {showEmoji && (
                <div className={`absolute top-10 left-0 z-50 p-2 rounded-xl shadow-2xl border grid grid-cols-8 gap-1 w-56 ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                  {EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => {
                      addItem("emoji", ""); updateItem; setShowEmoji(false); setItems(prev => {
                        const last = prev[prev.length - 1];
                        return prev.map(i => i.id === last?.id ? { ...i, text: emoji } : i);
                      });
                    }} className="text-2xl hover:scale-125 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            {/* MEDIA IMPORT */}
            <ToolBtn icon={<ImageIcon size={16} />} onClick={() => openMediaModal("image")} label="Add Image" dark={dm} />
            <ToolBtn icon={<Video size={16} />} onClick={() => openMediaModal("video")} label="Add Video" dark={dm} />

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            {/* ZOOM */}
            <ToolBtn icon={<ZoomOut size={16} />} onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} label="Zoom Out" dark={dm} />
            <span className={`text-xs font-bold w-10 text-center ${dm ? "text-slate-400" : "text-slate-500"}`}>{Math.round(zoom * 100)}%</span>
            <ToolBtn icon={<ZoomIn size={16} />} onClick={() => setZoom(z => Math.min(3, z + 0.1))} label="Zoom In" dark={dm} />

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            {/* DARK MODE */}
            <button onClick={() => { setDarkMode(!dm); localStorage.setItem("theme", !dm ? "dark" : "light"); }}
              className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-700 text-amber-400" : "hover:bg-slate-100 text-slate-500"}`}>
              {dm ? <Sun size={16} /> : <Moon size={16} />}
            </button>



            {/* PRESENTATION MODE */}
            <button onClick={() => setPresentationMode(true)}
              className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-700 text-indigo-400" : "hover:bg-slate-100 text-indigo-500"}`} title="Presentation">
              <Projector size={16} />
            </button>

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            {/* SAVE */}
            <button onClick={saveToBackend}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${saveStatus === "saving" ? "bg-amber-100 text-amber-600" : saveStatus === "error" ? "bg-rose-100 text-rose-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {saveStatus === "saving" ? <Loader2 className="animate-spin" size={13} /> : <CloudUpload size={13} />}
              {saveStatus === "saving" ? "Saving" : saveStatus === "error" ? "Retry" : "Save"}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── PROPERTIES PANEL ── */}
      <AnimatePresence>
        {((selectedId || tool === "draw") && !presentationMode && tool !== "eraser") && (
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className={`absolute bottom-14 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl shadow-2xl border flex flex-wrap items-center gap-3 z-50 ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
          >
            {tool === "draw" && !selectedId && <span className="text-[10px] font-bold text-slate-500 uppercase">PEN</span>}

            {/* Stroke color */}
            <div className="flex gap-1.5">
              {["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#0f172a", "#ec4899", "#ffffff"].map(c => (
                <button key={c} onClick={() => { if (tool === "draw" && !selectedId) setPenColor(c); else updateItem(selectedId, { color: c }); }}
                  className={`w-5 h-5 rounded-full border border-slate-300 hover:scale-125 transition-transform ${((tool === "draw" && penColor === c) || (selectedId && items.find(i => i.id === selectedId)?.color === c)) ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>

            <div className={`w-px h-7 ${dm ? "bg-slate-600" : "bg-slate-200"}`} />

            {/* Size/thickness */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Size</span>
              {selectedId && items.find(i => i.id === selectedId)?.type === "text" ? (
                <select className={`text-xs font-bold py-0.5 px-1.5 rounded outline-none ${dm ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"}`}
                  value={items.find(i => i.id === selectedId)?.fontSize || 16}
                  onChange={e => updateItem(selectedId, { fontSize: parseInt(e.target.value) })}>
                  {[12, 14, 16, 20, 24, 32, 48, 64, 80].map(s => <option key={s} value={s}>{s}px</option>)}
                </select>
              ) : (
                <input type="range" min="1" max="20" className="w-16 accent-indigo-600 h-1 cursor-pointer"
                  value={tool === "draw" && !selectedId ? penThickness : (items.find(i => i.id === selectedId)?.thickness || 3)}
                  onChange={e => { const v = parseInt(e.target.value); if (tool === "draw" && !selectedId) setPenThickness(v); else updateItem(selectedId, { thickness: v }); }} />
              )}
            </div>

            {/* Text-specific controls */}
            {selectedId && items.find(i => i.id === selectedId)?.type === "text" && (
              <>
                <div className={`w-px h-7 ${dm ? "bg-slate-600" : "bg-slate-200"}`} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Text Color</span>
                  <div className="flex gap-1">
                    {["#1e293b", "#6366f1", "#ef4444", "#10b981", "#f59e0b", "#ec4899", "#fff"].map(c => (
                      <button key={c} onClick={() => updateItem(selectedId, { fontColor: c })}
                        className={`w-5 h-5 rounded-full border border-slate-300 hover:scale-125 transition-transform ${items.find(i => i.id === selectedId)?.fontColor === c ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className={`w-px h-7 ${dm ? "bg-slate-600" : "bg-slate-200"}`} />
                <div className="flex gap-1">
                  <button onClick={() => updateItem(selectedId, { fontWeight: items.find(i => i.id === selectedId)?.fontWeight === "bold" ? "normal" : "bold" })}
                    className={`px-2 py-1 rounded-lg text-sm font-black transition-all ${items.find(i => i.id === selectedId)?.fontWeight === "bold" ? "bg-indigo-100 text-indigo-600" : (dm ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100")}`}>B</button>
                  <button onClick={() => updateItem(selectedId, { fontStyle: items.find(i => i.id === selectedId)?.fontStyle === "italic" ? "normal" : "italic" })}
                    className={`px-2 py-1 rounded-lg text-sm italic transition-all ${items.find(i => i.id === selectedId)?.fontStyle === "italic" ? "bg-indigo-100 text-indigo-600" : (dm ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100")}`}>I</button>
                </div>
              </>
            )}

            {/* Video timeline controls */}
            {selectedId && items.find(i => i.id === selectedId)?.type === "video" && (
              <>
                <div className={`w-px h-7 ${dm ? "bg-slate-600" : "bg-slate-200"}`} />
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Start (s)</span>
                    <input type="number" min="0" max="59" step="0.5"
                      className={`w-14 text-xs font-bold py-0.5 px-1.5 rounded outline-none ${dm ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"}`}
                      value={items.find(i => i.id === selectedId)?.timelineStart || 0}
                      onChange={e => updateItem(selectedId, { timelineStart: parseFloat(e.target.value) })} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Duration (s)</span>
                    <input type="number" min="1" max="60" step="0.5"
                      className={`w-14 text-xs font-bold py-0.5 px-1.5 rounded outline-none ${dm ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"}`}
                      value={items.find(i => i.id === selectedId)?.timelineDuration || 5}
                      onChange={e => updateItem(selectedId, { timelineDuration: parseFloat(e.target.value) })} />
                  </div>
                </div>
              </>
            )}

            <div className={`w-px h-7 ${dm ? "bg-slate-600" : "bg-slate-200"}`} />
            {selectedId ? (
              <button onClick={() => { setItems(items.filter(i => i.id !== selectedId)); setSelectedId(null); }}
                className="text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-full transition-colors"><Trash2 size={18} /></button>
            ) : (
              <button onClick={() => setTool("select")} className="text-slate-400 hover:text-slate-600 p-1.5"><X size={18} /></button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CANVAS AREA ── */}
      <div className="flex-1 overflow-hidden relative"
        ref={containerRef}
        style={{ cursor: tool === "draw" ? "crosshair" : tool === "eraser" ? "cell" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
      >
        <div className="relative origin-top-left" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, transform: `scale(${zoom})` }}>

          {/* Background pattern */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: bgType === "dots"
              ? `radial-gradient(${dm ? "#334155" : "#CBD5E1"} 1.5px, transparent 1.5px)`
              : `linear-gradient(${dm ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px), linear-gradient(90deg, ${dm ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px)`,
            backgroundSize: bgType === "dots" ? "28px 28px" : "40px 40px"
          }} />

          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 pointer-events-none z-10" />

          {items.map(item => (
            <div
              key={item.id}
              style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: selectedId === item.id ? 50 : 20 }}
              className={`absolute group ${selectedId === item.id ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
              onMouseDown={e => handleItemMouseDown(e, item)}
              onDoubleClick={() => { if (!["line", "arrow", "drawing"].includes(item.type)) { setEditingId(item.id); setSelectedId(item.id); } }}
            >
              {/* Image */}
              {item.type === "image" && <img src={item.src} alt="" className="w-full h-full object-cover rounded-lg pointer-events-none select-none shadow-md" />}

              {/* Video */}
              {item.type === "video" && (
                <video src={item.src} controls className="w-full h-full rounded-lg pointer-events-auto select-none shadow-md object-cover" />
              )}

              {/* Emoji sticker */}
              {item.type === "emoji" && (
                <div className="w-full h-full flex items-center justify-center text-5xl select-none pointer-events-none">{item.text}</div>
              )}

              {/* Sticky note */}
              {item.type === "sticky" && (
                <div className="w-full h-full rounded-lg shadow-lg relative overflow-hidden" style={{ backgroundColor: item.color }}>
                  <div className="absolute top-0 left-0 right-0 h-6 opacity-20" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.15),transparent)" }} />
                  <textarea
                    className="w-full h-full resize-none outline-none bg-transparent p-3 text-sm leading-relaxed"
                    style={{ fontSize: `${item.fontSize || 14}px`, fontWeight: item.fontWeight || "normal", color: "#1e293b" }}
                    value={item.text}
                    onChange={e => updateItem(item.id, { text: e.target.value })}
                    readOnly={editingId !== item.id}
                  />
                </div>
              )}

              {/* Text / Shapes textarea */}
              {item.type === "text" && (
                <textarea
                  className={`w-full h-full resize-none outline-none bg-transparent p-4 text-center leading-relaxed ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-lg shadow-sm border ${editingId !== item.id ? "pointer-events-none" : "pointer-events-auto cursor-text"}`}
                  style={{ fontSize: `${item.fontSize || 16}px`, fontWeight: item.fontWeight || "normal", fontStyle: item.fontStyle || "normal", color: item.fontColor || (dm ? "#f8fafc" : "#1e293b") }}
                  value={item.text}
                  onChange={e => updateItem(item.id, { text: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  readOnly={editingId !== item.id}
                />
              )}

              {/* Resize handles */}
              {selectedId === item.id && !["drawing", "emoji"].includes(item.type) && (
                <>
                  <ResizeHandle pos="top-left" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "top-left" }); }} />
                  <ResizeHandle pos="top-right" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "top-right" }); }} />
                  <ResizeHandle pos="bottom-left" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "bottom-left" }); }} />
                  <ResizeHandle pos="bottom-right" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "bottom-right" }); }} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPACT ALWAYS-VISIBLE PLANNING TIMELINE ── */}
      <PlanningTimeline
        isDark={dm}
        playhead={timelinePlayhead}
        setPlayhead={setTimelinePlayhead}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        totalDuration={TOTAL_DURATION}
      />

      {/* ── MEDIA IMPORT MODAL ── */}
      <AnimatePresence>
        {mediaModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${dm ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}>
              <div className="flex justify-between items-center mb-5">
                <h3 className={`font-black text-lg ${dm ? "text-white" : "text-slate-900"}`}>
                  Add {mediaModal === "image" ? "Image" : "Video"}
                </h3>
                <button onClick={() => setMediaModal(null)} className={`p-1 rounded-lg ${dm ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}>
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className={`flex rounded-xl p-0.5 mb-5 ${dm ? "bg-slate-800" : "bg-slate-100"}`}>
                {[["device", <Upload size={13} />, "From Device"], ["url", <Link size={13} />, "From URL"], ["cloud", <Cloud size={13} />, "Cloud URL"]].map(([tab, icon, label]) => (
                  <button key={tab} onClick={() => setMediaTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${mediaTab === tab ? (dm ? "bg-slate-700 text-white" : "bg-white text-indigo-600 shadow-sm") : (dm ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {mediaTab === "device" && (
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dm ? "border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/20" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"}`}
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mx-auto mb-3 text-indigo-500" size={32} />
                  <p className={`font-bold text-sm ${dm ? "text-slate-300" : "text-slate-700"}`}>Click to upload {mediaModal}</p>
                  <p className={`text-xs mt-1 ${dm ? "text-slate-500" : "text-slate-400"}`}>{mediaModal === "image" ? "PNG, JPG, GIF, WebP" : "MP4, WebM, MOV, AVI"}</p>
                  <input ref={fileInputRef} type="file" accept={mediaModal === "image" ? "image/*" : "video/*"} className="hidden" onChange={handleFileUpload} />
                </div>
              )}

              {(mediaTab === "url" || mediaTab === "cloud") && (
                <div>
                  <p className={`text-sm mb-3 ${dm ? "text-slate-400" : "text-slate-500"}`}>
                    {mediaTab === "cloud" ? "Paste a Google Drive, Dropbox, or any public cloud URL:" : `Paste a direct ${mediaModal} URL:`}
                  </p>
                  <input
                    autoFocus
                    type="text"
                    placeholder={mediaTab === "cloud" ? "https://drive.google.com/..." : `https://example.com/${mediaModal}.${mediaModal === "image" ? "jpg" : "mp4"}`}
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleUrlImport()}
                    className={`w-full p-3 rounded-xl border text-sm font-medium outline-none mb-4 ${dm ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-400"}`}
                  />
                  <button onClick={handleUrlImport}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors">
                    Add to Board
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for legacy support */}
      <input id="fileInput" type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
    </div>
  );
};

const ToolBtn = ({ icon, onClick, label, active, dark, activeColor }) => (
  <button onClick={onClick} title={label}
    className={`p-1.5 rounded-lg transition-all ${active ? `bg-white shadow ${activeColor || "text-indigo-600"}` : (dark ? "text-slate-400 hover:bg-slate-700 hover:text-indigo-400" : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600")}`}>
    {icon}
  </button>
);

const ResizeHandle = ({ pos, onMouseDown }) => {
  const style = pos === "top-left" ? "-top-1.5 -left-1.5" : pos === "top-right" ? "-top-1.5 -right-1.5" : pos === "bottom-left" ? "-bottom-1.5 -left-1.5" : "-bottom-1.5 -right-1.5";
  return <div onMouseDown={onMouseDown} className={`absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full shadow z-50 cursor-move ${style}`} />;
};

// ─── Compact Planning Timeline ─────────────────────────────────────────────
const PlanningTimeline = ({ isDark, playhead, setPlayhead, isPlaying, setIsPlaying, totalDuration }) => {
  const railRef = useRef(null);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const dm = isDark;

  // Advance playhead when playing
  useEffect(() => {
    if (isPlaying) {
      const tick = (ts) => {
        if (lastTimeRef.current !== null) {
          const delta = (ts - lastTimeRef.current) / 1000;
          setPlayhead(prev => {
            const next = prev + delta;
            if (next >= totalDuration) { setIsPlaying(false); return 0; }
            return next;
          });
        }
        lastTimeRef.current = ts;
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    } else {
      lastTimeRef.current = null;
      cancelAnimationFrame(animRef.current);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, totalDuration, setPlayhead, setIsPlaying]);

  // Click on rail → seek
  const handleRailClick = (e) => {
    if (!railRef.current) return;
    const r = railRef.current.getBoundingClientRect();
    const t = Math.max(0, Math.min(totalDuration, ((e.clientX - r.left) / r.width) * totalDuration));
    setPlayhead(t);
  };

  // Tick marks — finer every second, labeled every 5s
  const ticks = [];
  const step = 0.5; // mark every 0.5s
  for (let t = 0; t <= totalDuration; t = parseFloat((t + step).toFixed(2))) {
    const pct = (t / totalDuration) * 100;
    const isMajor = t % 5 === 0;
    const isMid = t % 1 === 0;
    ticks.push({ t, pct, isMajor, isMid });
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(2);
    return m > 0 ? `${m}:${sec.padStart(5, "0")}` : `${sec}s`;
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-40 flex flex-col border-t select-none ${dm ? "bg-slate-950 border-slate-800" : "bg-slate-900 border-slate-700"}`} style={{ height: 44 }}>
      {/* Controls row */}
      <div className="flex items-center gap-2 px-3 pb-0 pt-1 flex-shrink-0">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors flex-shrink-0"
        >
          {isPlaying ? <Pause size={9} /> : <Play size={9} />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        {/* Rail */}
        <div
          ref={railRef}
          onClick={handleRailClick}
          className="relative flex-1 h-3 rounded-full cursor-pointer overflow-visible"
          style={{ background: dm ? "#1e293b" : "#334155" }}
        >
          {/* Tick marks */}
          {ticks.map(({ t, pct, isMajor, isMid }) => (
            <div key={t}
              className="absolute top-0 pointer-events-none"
              style={{
                left: `${pct}%`,
                height: isMajor ? "100%" : isMid ? "60%" : "30%",
                width: 1,
                background: isMajor ? "#6366f1" : "#475569",
                opacity: isMajor ? 1 : 0.6,
              }}
            />
          ))}

          {/* Progress fill */}
          <div className="absolute top-0 left-0 bottom-0 rounded-full bg-indigo-600/30"
            style={{ width: `${(playhead / totalDuration) * 100}%` }} />

          {/* Playhead thumb */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-rose-400 border-2 border-white shadow-md z-10 cursor-grab"
            style={{ left: `${(playhead / totalDuration) * 100}%` }}
            onMouseDown={(downE) => {
              downE.stopPropagation();
              const move = (e) => {
                if (!railRef.current) return;
                const r = railRef.current.getBoundingClientRect();
                const t = Math.max(0, Math.min(totalDuration, ((e.clientX - r.left) / r.width) * totalDuration));
                setPlayhead(t);
              };
              const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          />
        </div>

        {/* Time display */}
        <span className="font-mono text-[10px] text-slate-400 flex-shrink-0 w-16 text-right">
          {formatTime(playhead)} / {totalDuration}s
        </span>
      </div>

      {/* Ruler label row */}
      <div className="relative flex-1 px-3">
        <div className="relative w-full h-full">
          {ticks.filter(t => t.isMajor).map(({ t, pct }) => (
            <span key={t}
              className="absolute text-[8px] text-slate-500 -translate-x-1/2 top-0"
              style={{ left: `${pct}%` }}
            >
              {t}s
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;