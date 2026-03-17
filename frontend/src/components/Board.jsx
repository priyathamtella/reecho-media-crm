import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type, Square, Circle, Triangle, Minus, MoveRight, Video,
  Trash2, Image as ImageIcon, CloudUpload, Loader2,
  Sun, Moon, Projector, X, PenTool, MousePointer2, Eraser,
  Upload, Link, Cloud, StickyNote, Smile, ZoomIn, ZoomOut,
  Play, Pause, Edit3, Check, Hand, ArrowLeft, Share2, FileText, ExternalLink
} from "lucide-react";

import ShareModal from "./ShareModal";

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
  const lastSavedRef = useRef(""); // To track last saved state for optimization

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
  const zoomRef = useRef(1);
  // pan = translate offset so the canvas inner div stays correctly positioned
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const [saveStatus, setSaveStatus] = useState("idle");
  const [bgType, setBgType] = useState("dots");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [presentationMode, setPresentationMode] = useState(false);
  const [userRole] = useState(() => localStorage.getItem("userRole") || "admin");
  const [boardData, setBoardData] = useState(null);

  const [spaceHeld, setSpaceHeld] = useState(false);
  const [dragPan, setDragPan] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);

  // Keep refs in sync with state so event handlers always see latest values
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        setSpaceHeld(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setSpaceHeld(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // ── Helper: screen (clientX/Y) → canvas coordinates ──────────────────────
  // Must use refs so it can be called inside event handlers without stale closure.
  const toCanvas = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    return {
      mx: (clientX - rect.left - panRef.current.x) / zoomRef.current,
      my: (clientY - rect.top  - panRef.current.y) / zoomRef.current,
    };
  }, []);

  // ── MOUSE WHEEL ZOOM-TO-CURSOR ────────────────────────────────────────────
  // Attached after isLoaded so containerRef is populated.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const cW = rect.width;
      const cH = rect.height;
      const prevZoom = zoomRef.current;
      const prevPan  = panRef.current;

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        const ZOOM_SPEED = 0.0015;
        const delta = -e.deltaY * ZOOM_SPEED;
        const rawZoom = prevZoom + delta * prevZoom;
        const newZoom = Math.round(Math.min(3, Math.max(0.15, rawZoom)) * 1000) / 1000;

        const canvasX = (cursorX - prevPan.x) / prevZoom;
        const canvasY = (cursorY - prevPan.y) / prevZoom;
        let newPanX = cursorX - canvasX * newZoom;
        let newPanY = cursorY - canvasY * newZoom;

        const scaledW = CANVAS_SIZE * newZoom;
        const scaledH = CANVAS_SIZE * newZoom;
        newPanX = scaledW < cW ? (cW - scaledW) / 2 : Math.min(0, Math.max(cW - scaledW, newPanX));
        newPanY = scaledH < cH ? (cH - scaledH) / 2 : Math.min(0, Math.max(cH - scaledH, newPanY));

        zoomRef.current = newZoom;
        panRef.current  = { x: newPanX, y: newPanY };
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        // Pan
        let newPanX = prevPan.x - e.deltaX;
        let newPanY = prevPan.y - e.deltaY;

        const scaledW = CANVAS_SIZE * prevZoom;
        const scaledH = CANVAS_SIZE * prevZoom;
        newPanX = scaledW < cW ? (cW - scaledW) / 2 : Math.min(0, Math.max(cW - scaledW, newPanX));
        newPanY = scaledH < cH ? (cH - scaledH) / 2 : Math.min(0, Math.max(cH - scaledH, newPanY));

        panRef.current = { x: newPanX, y: newPanY };
        setPan({ x: newPanX, y: newPanY });
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isLoaded]);

  // Media modal
  const [mediaModal, setMediaModal] = useState(null); // null | 'image' | 'video'
  const [mediaTab, setMediaTab] = useState("device"); // device | url | cloud
  const [mediaUrl, setMediaUrl] = useState("");
  const fileInputRef = useRef(null);

  // Emoji panel
  const [showEmoji, setShowEmoji] = useState(false);

  const CANVAS_SIZE = 4000;

  // ── 1. PARSER ──────────────────────────────
  const parseBoardData = (fullState) => {
    if (!fullState) return [];
    if (typeof fullState === "object") return Array.isArray(fullState) ? fullState : (fullState.items || []);
    if (typeof fullState === "string") {
      try {
        const parsed = JSON.parse(fullState);
        if (typeof parsed === "string") return parseBoardData(parsed);
        return Array.isArray(parsed) ? parsed : (parsed.items || []);
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
    if (!isLoaded || !canEdit) return;
    
    // Optimization: Check if state actually changed
    const currentState = JSON.stringify(itemsRef.current);
    if (currentState === lastSavedRef.current && boardTitle === titleRef.current) {
        return;
    }

    const token = localStorage.getItem("token");
    setSaveStatus("saving");
    try {
      await axios.post(`https://your-backend-url.com/api/boards/${id}/sync`,
        { 
          title: boardTitle, 
          fullState: JSON.stringify({ items: itemsRef.current }),
          reviewStatus: boardData?.reviewStatus,
          linkedTaskId: boardData?.linkedTaskId,
          linkedDocId: boardData?.linkedDocId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
      lastSavedRef.current = currentState;
      titleRef.current = boardTitle;
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch { setSaveStatus("error"); }
  }, [id, isLoaded, canEdit, boardTitle, boardData]);

  // ── 3. FETCH ─────────────────────────────────
  useEffect(() => {
    const fetchBoardAndTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Board
        const res = await axios.get(`https://your-backend-url.com/api/boards/${id}?t=${Date.now()}`, { headers });
        const bData = res.data.board || res.data; // fallback for safety
        setBoardData(bData);
        setBoardTitle(bData.title || "Untitled Board");
        const loadedItems = parseBoardData(bData.fullState);
        setItems(loadedItems);
        itemsRef.current = loadedItems;
        lastSavedRef.current = JSON.stringify(loadedItems);
        titleRef.current = bData.title || "Untitled Board";
        setIsLoaded(true);

        // Determine permissions
        const role = localStorage.getItem("userRole");
        const permission = res.data.permission || "viewer";
        if (role === "admin" || permission === "editor") {
          setCanEdit(true);
        } else {
          setCanEdit(false);
        }

        // Fetch Tasks & Docs (only for editors/admins/members)
        if (role === "admin" || role === "member") {
          const [tasksRes, docsRes] = await Promise.all([
            axios.get(`https://your-backend-url.com/api/tasks`, { headers }),
            axios.get(`https://your-backend-url.com/api/docs`, { headers })
          ]);
          setTasks(tasksRes.data || []);
          setDocuments(docsRes.data || []);
        }
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      }
    };
    fetchBoardAndTasks();
  }, [id, navigate]);

  const handleLinkTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`https://your-backend-url.com/api/boards/${id}/sync`, 
        { title: boardTitle, linkedTaskId: parseInt(taskId) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoardData(prev => ({ ...prev, linkedTaskId: parseInt(taskId) || 0 }));
      alert("Linked task updated!");
    } catch (e) { alert("Failed to link task."); }
  };

  const handleLinkDoc = async (docId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`https://your-backend-url.com/api/boards/${id}/sync`, 
        { title: boardTitle, linkedDocId: docId || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoardData(prev => ({ ...prev, linkedDocId: docId || "" }));
      alert("Linked document updated!");
    } catch (e) { alert("Failed to link document."); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this board? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://your-backend-url.com/api/boards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/dashboard");
    } catch (e) { alert("Failed to delete board."); }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(`https://your-backend-url.com/api/boards/${id}/submit-review`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewSent(true);
    } catch (e) { alert("Failed to submit review."); }
    finally { setSubmittingReview(false); }
  };

  const handleApprove = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`https://your-backend-url.com/api/boards/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoardData(prev => ({ ...prev, ReviewStatus: "approved" }));
      alert("Board approved!");
    } catch (e) { alert("Failed to approve board."); }
  };

  const handleClientAction = async (status, reason = "") => {
    const token = localStorage.getItem("token");
    setSaveStatus("saving");
    try {
      await axios.post(`https://your-backend-url.com/api/boards/${id}/sync`, {
        title: boardTitle,
        clientStatus: status,
        clientFeedback: reason
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBoardData(prev => ({ ...prev, clientStatus: status, clientFeedback: reason }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      if (status === "Rejected") setShowRejectModal(false);
    } catch { setSaveStatus("error"); }
  };

  // --- 4.5. 10s AUTO-SAVE ---
  useEffect(() => {
    if (!isLoaded || !canEdit) return;
    const interval = setInterval(() => {
      saveToBackend();
    }, 10000);
    return () => clearInterval(interval);
  }, [isLoaded, canEdit, saveToBackend]);
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
      } else if (item.type === "triangle") {
        ctx.moveTo(item.x + item.w / 2, item.y);
        ctx.lineTo(item.x + item.w, item.y + item.h);
        ctx.lineTo(item.x, item.y + item.h);
        ctx.closePath();
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
    if (e.button === 1 || spaceHeld || tool === "hand") {
      e.preventDefault();
      setDragPan({ startX: e.clientX, startY: e.clientY, initialPanX: pan.x, initialPanY: pan.y });
      return;
    }
    if (e.button !== 0) return;
    const { mx, my } = toCanvas(e.clientX, e.clientY);
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
    if (dragPan) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cW = rect.width;
      const cH = rect.height;
      const dx = e.clientX - dragPan.startX;
      const dy = e.clientY - dragPan.startY;

      let newPanX = dragPan.initialPanX + dx;
      let newPanY = dragPan.initialPanY + dy;

      const scaledW = CANVAS_SIZE * zoomRef.current;
      const scaledH = CANVAS_SIZE * zoomRef.current;
      newPanX = scaledW < cW ? (cW - scaledW) / 2 : Math.min(0, Math.max(cW - scaledW, newPanX));
      newPanY = scaledH < cH ? (cH - scaledH) / 2 : Math.min(0, Math.max(cH - scaledH, newPanY));

      panRef.current = { x: newPanX, y: newPanY };
      setPan({ x: newPanX, y: newPanY });
      return;
    }
    const { mx, my } = toCanvas(e.clientX, e.clientY);
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
    if (dragPan) {
      setDragPan(null);
      return;
    }
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
      const { mx, my } = toCanvas(e.clientX, e.clientY);
      setDraggingId(item.id); setSelectedId(item.id);
      setOffset({ x: mx - item.x, y: my - item.y });
    }
  };

  // ── 7. ADD ITEM ───────────────────────────────
  const addItem = (type, src = "") => {
    setTool("select");
    // Place new items in the centre of the currently visible canvas viewport
    const rect = containerRef.current?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight };
    const cx = (rect.width  / 2 - panRef.current.x) / zoomRef.current;
    const cy = (rect.height / 2 - panRef.current.y) / zoomRef.current;

    const defaults = {
      text: { w: 240, h: 120 },
      rect: { w: 160, h: 120 },
      circle: { w: 130, h: 130 },
      triangle: { w: 140, h: 130 },
      image: { w: 300, h: 200 },
      video: { w: 420, h: 300 },
      sticky: { w: 200, h: 160 },
      emoji: { w: 80, h: 80 },
      line: { w: 200, h: 40 },
      arrow: { w: 200, h: 40 },
    };
    const { w, h } = defaults[type] || { w: 150, h: 150 };
    
    // Debug: Ensure valid center
    console.log("[Board] Adding item:", { type, cx, cy, w, h, pan: panRef.current, zoom: zoomRef.current });

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
    // Determine type: use mediaModal if set, otherwise infer from file
    const itemType = mediaModal === "video" || isVideo ? "video" : "image";
    addItem(itemType, url);
    setMediaModal(null);
    setMediaUrl("");
    e.target.value = "";
  };

  const handleUrlImport = () => {
    if (!mediaUrl.trim()) return;
    addItem(mediaModal, mediaUrl.trim());
    setMediaModal(null); setMediaUrl("");
  };



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

      {/* ── TOP NAV BAR ── */}
      {!presentationMode && (
        <div className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 z-[60] ${dm ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden">
               <Projector size={18} />
            </div>
            
            {/* Title */}
            {editingTitle && canEdit ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className={`text-base font-bold outline-none border-b ${dm ? "bg-transparent border-indigo-400 text-white" : "bg-transparent border-indigo-500 text-slate-900"}`}
                    value={boardTitle}
                    onChange={e => setBoardTitle(e.target.value)}
                    onBlur={() => { setEditingTitle(false); saveToBackend(); }}
                    onKeyDown={e => { if (e.key === "Enter") { setEditingTitle(false); saveToBackend(); } }}
                  />
                  <button onClick={() => { setEditingTitle(false); saveToBackend(); }} className="text-emerald-500"><Check size={14} /></button>
                </div>
            ) : (
                <div className="flex flex-col text-left">
                  <button onClick={() => canEdit && setEditingTitle(true)} className={`text-base font-bold transition-opacity ${dm ? "text-white" : "text-slate-900"} ${canEdit ? "hover:opacity-70" : ""}`}>
                    {boardTitle || "Untitled Board"}
                  </button>
                  {boardData?.reviewStatus === "in_review" && (
                     <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Under Review by Admin</span>
                  )}
                </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Save status */}
            <span className={`text-xs font-medium transition-all mr-2 ${saveStatus === "saving" ? "text-amber-500" : saveStatus === "saved" ? "text-emerald-500" : saveStatus === "error" ? "text-rose-500" : "opacity-0"}`}>
                {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Save failed" : "·"}
            </span>

            {/* Badges */}
            {boardData?.linkedTaskId && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/10">
                   <Link size={11} /> Task: {tasks.find(t => (t.id || t.ID) === boardData.linkedTaskId)?.title.slice(0, 16) || "Linked"}
                </div>
            )}
            {boardData?.linkedDocId && (
                <button 
                  onClick={() => navigate(`/docs/${boardData.linkedDocId}`)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                >
                   <FileText size={11} /> Doc: {documents.find(d => String(d.id || d.ID) === String(boardData.linkedDocId))?.title || "Linked"}
                </button>
            )}

            <div className={`h-5 w-px mx-1 ${dm ? "bg-slate-800" : "bg-slate-200"}`} />

            {/* Linkers */}
            {canEdit && (
                <div className="flex gap-2">
                   <select 
                    className={`text-[10px] bg-transparent outline-none border rounded px-1 font-bold ${dm ? "text-slate-400 border-slate-700" : "text-slate-500 border-slate-200"}`}
                    value={boardData?.linkedTaskId || ""}
                    onChange={e => handleLinkTask(e.target.value)}
                  >
                    <option value="">Link Task...</option>
                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                   <select 
                    className={`text-[10px] bg-transparent outline-none border rounded px-1 font-bold ${dm ? "text-slate-400 border-slate-700" : "text-slate-500 border-slate-200"}`}
                    value={boardData?.linkedDocId || ""}
                    onChange={e => handleLinkDoc(e.target.value)}
                  >
                    <option value="">Link Doc...</option>
                    {documents.map(d => <option key={d.id} value={d.id}>{d.title || "Untitled"}</option>)}
                  </select>
                </div>
            )}

            {/* Actions */}
            {userRole === "admin" && (
                <button onClick={() => setShowShareModal(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${dm ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    <Share2 size={13} /> Share
                </button>
            )}

            {userRole === "member" && (
                <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || reviewSent || boardData?.reviewStatus === "approved"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        reviewSent || boardData?.reviewStatus === "approved"
                            ? "bg-emerald-500 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}>
                    {submittingReview ? <Loader2 size={13} className="animate-spin" /> : (reviewSent || boardData?.reviewStatus === "approved") ? <Check size={13} /> : <CloudUpload size={13} />}
                    {boardData?.reviewStatus === "approved" ? "Approved" : reviewSent ? "Sent to Admin!" : "Submit for Review"}
                </button>
            )}

            {userRole === "admin" && boardData?.reviewStatus === "in_review" && (
                <button onClick={handleApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                    <Check size={13} /> Approve Board
                </button>
            )}

            {canEdit && (
                <button onClick={saveToBackend}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                    <CloudUpload size={13} /> Save
                </button>
            )}

            {userRole === "admin" && (
                <button onClick={handleDelete}
                    className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-rose-500/20 text-slate-400 hover:text-rose-400" : "hover:bg-rose-50 text-slate-500 hover:text-rose-500"}`}>
                    <Trash2 size={16} />
                </button>
            )}
          </div>
        </div>
      )}

      {/* ── EMOJI PICKER ── */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className={`absolute bottom-20 left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-2xl border z-[70] grid grid-cols-8 gap-3 ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => addEmojiItem(e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOOLBAR (Bottom floating) ── */}
      <AnimatePresence>
        {(!presentationMode && isLoaded) && (
          <motion.nav
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-2xl border z-50 ${dm ? "bg-slate-800/95 border-slate-700" : "bg-white/95 border-slate-200"}`}
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* TOOLS */}
            {canEdit ? (
              <div className="flex items-center gap-2">
                <div className={`flex p-0.5 rounded-xl ${dm ? "bg-slate-700/60" : "bg-slate-100"}`}>
                  <ToolBtn icon={<MousePointer2 size={16} />} onClick={() => setTool("select")} label="Select" active={tool === "select"} dark={dm} />
                  <ToolBtn icon={<Hand size={16} />} onClick={() => setTool("hand")} label="Pan" active={tool === "hand"} dark={dm} />
                  <ToolBtn icon={<PenTool size={16} />} onClick={() => setTool("draw")} label="Draw" active={tool === "draw"} dark={dm} />
                  <ToolBtn icon={<Eraser size={16} />} onClick={() => setTool("eraser")} label="Eraser" active={tool === "eraser"} dark={dm} activeColor="text-rose-500" />
                </div>

                <div className={`w-px h-6 mx-1 ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

                <div className={`flex p-0.5 rounded-xl ${dm ? "bg-slate-700/60" : "bg-slate-100"}`}>
                   <ToolBtn icon={<Type size={16} />} onClick={() => addItem("text")} label="Text" dark={dm} />
                   <div className="relative group">
                      <ToolBtn icon={<Square size={16} />} label="Shapes" dark={dm} />
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 rounded-xl shadow-xl border flex gap-1 items-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                        <button onClick={() => addItem("rect")} className={`p-1.5 rounded-lg ${dm ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}><Square size={14} /></button>
                        <button onClick={() => addItem("circle")} className={`p-1.5 rounded-lg ${dm ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}><Circle size={14} /></button>
                        <button onClick={() => addItem("triangle")} className={`p-1.5 rounded-lg ${dm ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}><Triangle size={14} /></button>
                      </div>
                   </div>
                   <button onClick={() => addItem("line")} className={`p-2 rounded-lg transition-colors ${dm ? "text-slate-400 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-200"}`} title="Line"><Minus size={16} /></button>
                   <button onClick={() => addItem("arrow")} className={`p-2 rounded-lg transition-colors ${dm ? "text-slate-400 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-200"}`} title="Arrow"><MoveRight size={16} /></button>
                   <ToolBtn icon={<StickyNote size={16} />} onClick={() => addItem("sticky")} label="Sticky" dark={dm} />
                   <ToolBtn icon={<Smile size={16} />} onClick={() => setShowEmoji(!showEmoji)} active={showEmoji} label="Emoji" dark={dm} />
                </div>

                <div className={`w-px h-6 mx-1 ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

                <div className={`flex p-0.5 rounded-xl ${dm ? "bg-slate-700/60" : "bg-slate-100"}`}>
                   <ToolBtn icon={<ImageIcon size={16} />} onClick={() => openMediaModal("image")} label="Image" dark={dm} />
                   <ToolBtn icon={<Video size={16} />} onClick={() => openMediaModal("video")} label="Video" dark={dm} />
                </div>
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
                <MousePointer2 size={14} /> View Only
              </div>
            )}

            {/* ZOOM */}
            <div className="flex items-center gap-1">
              <ToolBtn icon={<ZoomOut size={14} />} onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} dark={dm} />
              <span className={`text-[10px] font-bold w-12 text-center ${dm ? "text-slate-400" : "text-slate-500"}`}>{Math.round(zoom * 100)}%</span>
              <ToolBtn icon={<ZoomIn size={14} />} onClick={() => setZoom(z => Math.min(3, z + 0.1))} dark={dm} />
            </div>

            <div className={`h-5 w-px ${dm ? "bg-slate-700" : "bg-slate-200"}`} />

            <button onClick={() => { setDarkMode(!dm); localStorage.setItem("theme", !dm ? "dark" : "light"); }}
              className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-700 text-amber-400" : "hover:bg-slate-100 text-slate-500"}`}>
              {dm ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── PROPERTIES PANEL ── */}
      <AnimatePresence>
        {((selectedId || tool === "draw") && !presentationMode && tool !== "eraser" && canEdit) && (
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
              {selectedId && ["text", "rect", "circle", "triangle", "sticky"].includes(items.find(i => i.id === selectedId)?.type) ? (
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

            {/* Text controls — for text, rect, circle, triangle, sticky */}
            {selectedId && ["text", "rect", "circle", "triangle", "sticky"].includes(items.find(i => i.id === selectedId)?.type) && (
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
        style={{ cursor: dragPan ? "grabbing" : (tool === "hand" || spaceHeld) ? "grab" : tool === "draw" ? "crosshair" : tool === "eraser" ? "cell" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        id="board-canvas-area"
      >
        <div className="relative" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>

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

              {/* Video with Mini Timeline — uses stable VideoItem sub-component */}
              {item.type === "video" && (
                <VideoItem item={item} isDark={dm} onUpdate={(fields) => updateItem(item.id, fields)} />
              )}

              {/* Shape text overlay — rect, circle, triangle */}
              {["rect", "circle", "triangle"].includes(item.type) && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <textarea
                    autoFocus={editingId === item.id}
                    className={`w-4/5 h-3/4 resize-none outline-none bg-transparent text-center leading-relaxed ${editingId === item.id ? "pointer-events-auto cursor-text" : "pointer-events-none"}`}
                    style={{
                      fontSize: `${item.fontSize || 16}px`,
                      fontWeight: item.fontWeight || "normal",
                      fontStyle: item.fontStyle || "normal",
                      color: item.fontColor || (dm ? "#f8fafc" : "#1e293b"),
                    }}
                    value={item.text || ""}
                    onChange={e => updateItem(item.id, { text: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    readOnly={editingId !== item.id}
                    placeholder={editingId === item.id ? "Type here..." : ""}
                  />
                </div>
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
                    autoFocus={editingId === item.id}
                    className={`w-full h-full resize-none outline-none bg-transparent p-3 text-sm leading-relaxed ${editingId === item.id ? "pointer-events-auto cursor-text" : "pointer-events-none"}`}
                    style={{ fontSize: `${item.fontSize || 14}px`, fontWeight: item.fontWeight || "normal", color: "#1e293b" }}
                    value={item.text}
                    onChange={e => updateItem(item.id, { text: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    readOnly={editingId !== item.id}
                  />
                </div>
              )}

              {/* Text / Shapes textarea */}
              {item.type === "text" && (
                <textarea
                  autoFocus={editingId === item.id}
                  className={`w-full h-full resize-none outline-none bg-transparent p-4 text-center leading-relaxed ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-lg shadow-sm border ${editingId !== item.id ? "pointer-events-none" : "pointer-events-auto cursor-text"}`}
                  style={{ fontSize: `${item.fontSize || 16}px`, fontWeight: item.fontWeight || "normal", fontStyle: item.fontStyle || "normal", color: item.fontColor || (dm ? "#f8fafc" : "#1e293b") }}
                  value={item.text}
                  onChange={e => updateItem(item.id, { text: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  readOnly={editingId !== item.id}
                />
              )}

              {/* Resize handles */}
              {selectedId === item.id && !["drawing", "emoji", "video"].includes(item.type) && (
                <>
                  <ResizeHandle key={`${item.id}-tl`} pos="top-left" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "top-left" }); }} />
                  <ResizeHandle key={`${item.id}-tr`} pos="top-right" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "top-right" }); }} />
                  <ResizeHandle key={`${item.id}-bl`} pos="bottom-left" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "bottom-left" }); }} />
                  <ResizeHandle key={`${item.id}-br`} pos="bottom-right" onMouseDown={e => { e.stopPropagation(); setResizing({ id: item.id, handle: "bottom-right" }); }} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>



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

      {/* ── SHARE MODAL ── */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        resourceType="board"
        resourceId={id}
        isDark={dm}
      />
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

// ─── Mini Video Timeline (per-card) ─────────────────────────────────────────
// Stable video item wrapper so videoRef persists across renders
const VideoItem = ({ item, isDark, onUpdate }) => {
  const videoElRef = useRef(null);
  return (
    <div className="w-full h-full flex flex-col pointer-events-none" style={{ minHeight: 0 }}>
      <video
        ref={videoElRef}
        src={item.src}
        preload="metadata"
        playsInline
        className="w-full rounded-t-lg pointer-events-auto shadow-md object-cover"
        style={{ flex: 1, minHeight: 0 }}
        onError={(e) => console.error("Video Object Load Error", e)}
        onDragStart={e => e.preventDefault()}
      />
      {item.src && (
         <MiniVideoTimeline
          videoElRef={videoElRef}
          item={item}
          isDark={isDark}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

const MiniVideoTimeline = ({ item, isDark, onUpdate, videoElRef }) => {
  const railRef = useRef(null);
  const dm = isDark;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const trimIn = item.trimIn || 0;
  const trimOut = item.trimOut || duration || 0;

  // Connect to the video element via ref
  useEffect(() => {
    const el = videoElRef?.current;
    if (!el) return;
    const onMeta = () => {
      setDuration(el.duration || 0);
      if (!item.trimOut) onUpdate({ trimOut: el.duration || 0 });
    };
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onEnded = () => setPlaying(false);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    if (el.readyState >= 1) onMeta(); // already loaded
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [videoElRef, item.id]);

  // Play / Pause
  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoElRef?.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else {
      if (v.currentTime < trimIn || v.currentTime >= trimOut) v.currentTime = trimIn;
      v.play(); setPlaying(true);
    }
  };

  // Stop at trim-out
  useEffect(() => {
    if (!playing || !videoElRef?.current) return;
    const iv = setInterval(() => {
      const v = videoElRef?.current;
      if (v && v.currentTime >= trimOut) { v.pause(); v.currentTime = trimIn; setPlaying(false); }
    }, 100);
    return () => clearInterval(iv);
  }, [playing, trimIn, trimOut]);

  // Click rail → seek
  const seekTo = (e) => {
    e.stopPropagation();
    if (!railRef.current || !videoElRef?.current || !duration) return;
    const r = railRef.current.getBoundingClientRect();
    const t = Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * duration));
    videoElRef.current.currentTime = t;
    setCurrentTime(t);
  };

  // Drag trim handle
  const handleTrimDrag = (type, e) => {
    e.stopPropagation(); e.preventDefault();
    const move = (ev) => {
      if (!railRef.current || !duration) return;
      const r = railRef.current.getBoundingClientRect();
      const t = Math.max(0, Math.min(duration, ((ev.clientX - r.left) / r.width) * duration));
      if (type === "in") onUpdate({ trimIn: Math.min(t, (item.trimOut || duration) - 0.5) });
      else onUpdate({ trimOut: Math.max(t, (item.trimIn || 0) + 0.5) });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const pct = (duration > 0 && !isNaN(duration) && !isNaN(currentTime)) ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0;
  const trimInSafe = isNaN(trimIn) ? 0 : trimIn;
  const trimOutSafe = isNaN(trimOut) ? duration : trimOut;

  const trimInPct = (duration > 0 && !isNaN(duration)) ? Math.max(0, Math.min(100, (trimInSafe / duration) * 100)) : 0;
  let trimOutPct = 100;
  if (duration > 0 && !isNaN(duration) && !isNaN(trimOutSafe)) {
     trimOutPct = Math.max(0, Math.min(100, (trimOutSafe / duration) * 100));
  }

  // Prevent overlap or logic inversion
  if (trimInPct > trimOutPct) {
    trimOutPct = trimInPct;
  }

  return (
    <div
      className={`rounded-b-lg border-t pointer-events-auto select-none ${dm ? "bg-slate-900/95 border-slate-700" : "bg-slate-950/95 border-slate-700"
        }`}
      style={{ backdropFilter: "blur(8px)" }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ── Scrub bar with trim handles ── */}
      <div className="px-2 pt-1.5 pb-1">
        <div
          ref={railRef}
          onClick={seekTo}
          className="relative w-full h-2.5 rounded-full cursor-pointer group"
          style={{ background: dm ? "#1e293b" : "#334155" }}
        >
          {/* Trim region highlight */}
          <div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              left: `${trimInPct}%`,
              width: `${Math.max(0, trimOutPct - trimInPct)}%`,
              background: "rgba(99,102,241,0.3)",
            }}
          />

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 bottom-0 rounded-full bg-indigo-500"
            style={{ width: `${Math.min(pct, trimOutPct)}%` }}
          />

          {/* Trim In handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-4 rounded-sm bg-emerald-400 cursor-col-resize z-20 shadow-sm hover:bg-emerald-300 transition-colors"
            style={{ left: `${trimInPct}%` }}
            title={`Start: ${fmt(trimIn)}`}
            onMouseDown={(e) => handleTrimDrag("in", e)}
          />

          {/* Trim Out handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-4 rounded-sm bg-rose-400 cursor-col-resize z-20 shadow-sm hover:bg-rose-300 transition-colors"
            style={{ left: `${trimOutPct}%` }}
            title={`End: ${fmt(trimOut)}`}
            onMouseDown={(e) => handleTrimDrag("out", e)}
          />

          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-3.5 rounded-full bg-white shadow z-10"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Time labels + Play button ── */}
      <div className="flex items-center gap-1.5 px-2 pb-1.5">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm flex-shrink-0"
        >
          {playing ? <Pause size={9} /> : <Play size={9} style={{ marginLeft: 1 }} />}
        </button>

        {/* Start time */}
        <div className="flex items-center gap-0.5">
          <span className="text-[8px] font-bold text-emerald-400 uppercase">Start</span>
          <span className="font-mono text-[9px] text-emerald-300 tabular-nums">{fmt(trimIn)}</span>
        </div>

        {/* Current time */}
        <div className="flex-1 text-center">
          <span className="font-mono text-[10px] text-white/70 tabular-nums">{fmt(currentTime)}</span>
        </div>

        {/* End time */}
        <div className="flex items-center gap-0.5">
          <span className="text-[8px] font-bold text-rose-400 uppercase">End</span>
          <span className="font-mono text-[9px] text-rose-300 tabular-nums">{fmt(trimOut)}</span>
        </div>
      </div>
    </div>
  );
};

export default Board;