import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Type, Square, Circle, Minus, MoveRight, 
  Trash2, Image as ImageIcon, Undo, Redo, CloudUpload, Loader2,
  Grid3X3, Sun, Moon, Projector, X, PenTool, MousePointer2, Eraser
} from "lucide-react";

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
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // UI State
  const [tool, setTool] = useState("select"); // select, draw, eraser
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
  const [darkMode, setDarkMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const CANVAS_SIZE = 4000;

  // --- 1. PARSER ---
  const parseBoardData = (fullState) => {
    if (!fullState) return [];
    if (typeof fullState === 'object') return fullState.items || [];
    if (typeof fullState === 'string') {
      try {
        const parsed = JSON.parse(fullState);
        if (typeof parsed === 'string') return parseBoardData(parsed);
        return parsed.items || [];
      } catch (e) { return []; }
    }
    return [];
  };

  // --- 2. SYNC LOGIC ---
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
        { 
          Title: titleRef.current, 
          fullState: JSON.stringify({ items: itemsRef.current }) 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) { setSaveStatus("error"); }
  }, [id, isLoaded]);

  // --- 3. FETCH LOGIC ---
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

  // --- 4. CANVAS RENDERING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    const strokeColor = darkMode ? "#a5b4fc" : "#6366f1";

    // 4a. Render Items
    items.forEach((item) => {
      if (item.type === 'text' || item.type === 'image') return;

      ctx.save();
      ctx.lineWidth = item.thickness || 3;
      const drawColor = (item.color === '#6366f1') ? strokeColor : item.color;
      ctx.strokeStyle = drawColor;
      ctx.fillStyle = drawColor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      
      if (item.type === 'drawing') {
        if (item.points && item.points.length > 0) {
            ctx.moveTo(item.points[0].x, item.points[0].y);
            item.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }
      } else if (item.type === 'rect') {
        ctx.globalAlpha = 0.1; ctx.fillStyle = drawColor;
        ctx.roundRect(item.x, item.y, item.w, item.h, 12);
        ctx.fill(); ctx.globalAlpha = 1.0; ctx.stroke();
      } else if (item.type === 'circle') {
        ctx.globalAlpha = 0.1;
        ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.w / 2, 0, Math.PI * 2);
        ctx.fill(); ctx.globalAlpha = 1.0; ctx.stroke();
      } else if (item.type === 'line') {
        ctx.moveTo(item.x, item.y + item.h / 2); ctx.lineTo(item.x + item.w, item.y + item.h / 2); ctx.stroke();
      } else if (item.type === 'arrow') {
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

    // 4b. Render Active Drawing
    if (isDrawing && currentPath.length > 0) {
        ctx.save();
        ctx.lineWidth = penThickness;
        ctx.strokeStyle = penColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        ctx.restore();
    }

  }, [items, darkMode, isDrawing, currentPath, penColor, penThickness]);

  // --- 5. INTERACTIONS ---
  
  // Helper: Check if point touches line (for eraser)
  const isPointNearLine = (px, py, p1, p2) => {
      const dist = Math.abs((p2.y - p1.y) * px - (p2.x - p1.x) * py + p2.x * p1.y - p2.y * p1.x) / 
                   Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
      return dist < 10; // Threshold
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const mx = e.pageX / zoom;
    const my = e.pageY / zoom;
    
    // DRAW MODE
    if (tool === 'draw') {
        setIsDrawing(true);
        setCurrentPath([{ x: mx, y: my }]);
        return;
    }

    // ERASER MODE
    if (tool === 'eraser') {
        setIsDrawing(true); // Re-use isDrawing to track mouse down state for dragging eraser
        // Immediate delete on click
        const remainingItems = items.filter(item => {
            if (item.type !== 'drawing') return true; // Only erase drawings? Remove this line to erase everything
            // Simple bounding box check for drawings
            const xPoints = item.points.map(p => p.x);
            const yPoints = item.points.map(p => p.y);
            const minX = Math.min(...xPoints) - 10;
            const maxX = Math.max(...xPoints) + 10;
            const minY = Math.min(...yPoints) - 10;
            const maxY = Math.max(...yPoints) + 10;
            
            return !(mx >= minX && mx <= maxX && my >= minY && my <= maxY);
        });
        
        if (remainingItems.length !== items.length) {
            setItems(remainingItems);
            itemsRef.current = remainingItems;
        }
        return;
    }

    // SELECT MODE (Deselect)
    setSelectedId(null);
    setEditingId(null);
  };

  const handleMouseMove = (e) => {
    const mx = e.pageX / zoom;
    const my = e.pageY / zoom;

    // Drawing
    if (isDrawing && tool === 'draw') {
        setCurrentPath(prev => [...prev, { x: mx, y: my }]);
        return;
    }

    // Eraser Dragging
    if (isDrawing && tool === 'eraser') {
        const remainingItems = items.filter(item => {
            if (item.type !== 'drawing') return true;
            
            // Check if mouse point is near any line segment of the drawing
            for(let i=0; i<item.points.length-1; i++) {
                if (isPointNearLine(mx, my, item.points[i], item.points[i+1])) {
                    return false; // DELETE IT
                }
            }
            return true;
        });
        
        if (remainingItems.length !== items.length) {
            setItems(remainingItems);
            itemsRef.current = remainingItems;
        }
        return;
    }

    // Move
    if (draggingId) {
      setItems(items.map(i => i.id === draggingId ? { ...i, x: mx - offset.x, y: my - offset.y } : i));
    } 
    // Resize
    else if (resizing) {
      const { id, handle } = resizing;
      setItems(items.map(i => {
        if (i.id !== id) return i;
        let { x, y, w, h } = i;
        if (handle.includes('right')) w = Math.max(20, mx - x);
        if (handle.includes('bottom')) h = Math.max(20, my - y);
        if (handle.includes('left')) { const dw = mx - x; w -= dw; x = mx; }
        if (handle.includes('top')) { const dh = my - y; h -= dh; y = my; }
        return { ...i, x, y, w, h };
      }));
    }
  };

  const handleMouseUp = () => {
    if (tool === 'draw' && isDrawing) {
        setIsDrawing(false);
        if (currentPath.length > 1) {
            const newDrawing = {
                id: Date.now(),
                type: 'drawing',
                points: currentPath,
                color: penColor,
                thickness: penThickness,
                x: 0, y: 0, w: 0, h: 0 
            };
            const newItems = [...items, newDrawing];
            setItems(newItems);
            itemsRef.current = newItems; 
        }
        setCurrentPath([]);
    } else if (tool === 'eraser') {
        setIsDrawing(false);
    } else {
        setDraggingId(null);
        setResizing(null);
    }
  };

  const handleItemMouseDown = (e, item) => {
    if (tool === 'draw' || tool === 'eraser') return; 
    e.stopPropagation();
    if (e.button === 0 && editingId !== item.id) {
        setDraggingId(item.id);
        setSelectedId(item.id);
        setOffset({ x: e.pageX / zoom - item.x, y: e.pageY / zoom - item.y });
    }
  };

  const addItem = (type) => {
    setTool('select'); 
    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;
    
    let content = '';
    if (type === 'image') {
       content = prompt("Enter Image URL:", "https://via.placeholder.com/300");
       if (!content) return;
    }

    const newItem = {
      id: Date.now(), type,
      x: (scrollX + window.innerWidth/2) / zoom - 100,
      y: (scrollY + window.innerHeight/2) / zoom - 100,
      w: type === 'text' ? 240 : (type === 'image' ? 300 : 150),
      h: type === 'text' ? 120 : (type === 'image' ? 200 : 150),
      color: '#6366f1', text: '', src: content,
      fontSize: 16, fontWeight: 'normal', 
      fontColor: darkMode ? '#f8fafc' : '#1e293b', 
      thickness: 4
    };
    
    setItems([...items, newItem]);
  };

  const updateItem = (id, fields) => {
    setItems(items.map(i => i.id === id ? { ...i, ...fields } : i));
  };

  if (!isLoaded) return <div className="h-screen w-screen flex items-center justify-center bg-[#F0F4F8] text-slate-400 gap-2"><Loader2 className="animate-spin" /> Loading Board...</div>;

  return (
    <div className={`h-screen w-screen overflow-hidden relative font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#F0F4F8] text-slate-900'}`}>
      
      {presentationMode && (
         <button onClick={() => setPresentationMode(false)} className="fixed top-6 right-6 z-[60] bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all">
             <X size={24} />
         </button>
      )}

      {/* NAVBAR */}
      <AnimatePresence>
      {!presentationMode && (
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border z-50 transition-all ${darkMode ? 'bg-slate-800/90 border-slate-700 shadow-slate-900/50' : 'bg-white/90 border-white/40'}`}
      >
        <button onClick={() => navigate("/")} className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><LayoutDashboard size={18}/></button>
        <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        
        {/* TOOLS GROUP */}
        <div className="flex bg-slate-100/50 p-1 rounded-xl">
            <button onClick={() => setTool('select')} className={`p-1.5 rounded-lg transition-all ${tool === 'select' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} title="Select">
                <MousePointer2 size={18} />
            </button>
            <button onClick={() => setTool('draw')} className={`p-1.5 rounded-lg transition-all ${tool === 'draw' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} title="Draw">
                <PenTool size={18} />
            </button>
            <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-lg transition-all ${tool === 'eraser' ? 'bg-white shadow text-rose-500' : 'text-slate-500'}`} title="Eraser">
                <Eraser size={18} />
            </button>
        </div>

        <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        
        <div className="flex gap-1">
          <ToolBtn icon={<Type size={18}/>} onClick={() => addItem('text')} label="Text" dark={darkMode} />
          <ToolBtn icon={<Square size={18}/>} onClick={() => addItem('rect')} label="Box" dark={darkMode} />
          <ToolBtn icon={<Circle size={18}/>} onClick={() => addItem('circle')} label="Circle" dark={darkMode} />
          <ToolBtn icon={<ImageIcon size={18}/>} onClick={() => addItem('image')} label="Image" dark={darkMode} />
          <ToolBtn icon={<Minus size={18}/>} onClick={() => addItem('line')} label="Line" dark={darkMode} />
          <ToolBtn icon={<MoveRight size={18}/>} onClick={() => addItem('arrow')} label="Arrow" dark={darkMode} />
        </div>
        
        <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        
        <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-yellow-400' : 'hover:bg-slate-100 text-slate-500'}`}>
           {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button onClick={() => setPresentationMode(true)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-indigo-400' : 'hover:bg-slate-100 text-indigo-500'}`} title="Presentation Mode">
            <Projector size={18} />
        </button>

        <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

        <button 
          onClick={() => saveToBackend()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
            saveStatus === 'saving' ? 'bg-amber-100 text-amber-600' : 
            saveStatus === 'error' ? 'bg-rose-100 text-rose-600' :
            'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={14} /> : <CloudUpload size={14} />}
          {saveStatus === 'saving' ? "Saving" : saveStatus === 'error' ? "Retry" : "Save"}
        </button>
      </motion.nav>
      )}
      </AnimatePresence>

      {/* PROPERTIES PANEL */}
      <AnimatePresence>
        {((selectedId || tool === 'draw') && !presentationMode && tool !== 'eraser') && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-2xl border flex items-center gap-5 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
          >
             {tool === 'draw' && !selectedId && (<span className="text-[10px] font-bold text-slate-500 uppercase mr-[-10px]">PEN</span>)}

            {/* Color Palette */}
            <div className="flex gap-2">
            {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#0f172a', '#ffffff'].map(c => (
                <button key={c} 
                  onClick={() => { 
                      if (tool === 'draw' && !selectedId) setPenColor(c); 
                      else updateItem(selectedId, { color: c });
                  }}
                  className={`w-5 h-5 rounded-full border border-slate-200 hover:scale-125 transition-transform shadow-sm ${((tool === 'draw' && penColor === c) || (selectedId && items.find(i=>i.id===selectedId)?.color === c)) ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`} 
                  style={{backgroundColor: c}} 
                />
            ))}
            </div>
            
            <div className={`w-px h-8 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />

            {/* Thickness / Size */}
            <div className="flex flex-col gap-1">
               <span className="text-[10px] font-bold text-slate-500 uppercase">Size</span>
               <div className="flex items-center gap-2">
                 {(selectedId && items.find(i => i.id === selectedId)?.type === 'text') ? (
                     <select className={`text-xs font-bold py-1 px-2 rounded outline-none ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'}`}
                      onChange={(e) => updateItem(selectedId, { fontSize: parseInt(e.target.value) })}>
                      {[12, 14, 16, 20, 24, 32, 48, 64].map(s => <option key={s} value={s}>{s}px</option>)}
                     </select>
                 ) : (
                     <input type="range" min="1" max="20" className="w-20 accent-indigo-600 h-1 rounded-lg cursor-pointer"
                       value={tool === 'draw' && !selectedId ? penThickness : (items.find(i => i.id === selectedId)?.thickness || 3)}
                       onChange={(e) => {
                           const val = parseInt(e.target.value);
                           if (tool === 'draw' && !selectedId) setPenThickness(val);
                           else updateItem(selectedId, { thickness: val });
                       }} />
                 )}
               </div>
            </div>
            
            <div className={`w-px h-8 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
            
            {selectedId ? (
                <button onClick={() => {
                    const newItems = items.filter(i => i.id !== selectedId);
                    setItems(newItems); setSelectedId(null);
                }} className="text-rose-500 hover:bg-rose-500/20 p-2 rounded-full transition-colors"><Trash2 size={20} /></button>
            ) : (
                <button onClick={() => setTool('select')} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANVAS CONTAINER */}
      <div 
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${tool === 'draw' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-not-allowed' : 'cursor-default'}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
      >
        <div className="relative origin-top-left transition-transform duration-75 ease-out" 
             style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, transform: `scale(${zoom})` }}>
          
          {/* Background */}
           <div className="absolute inset-0 pointer-events-none" 
             style={{ 
                 backgroundImage: bgType === 'dots' 
                  ? `radial-gradient(${darkMode ? '#334155' : '#CBD5E1'} 1px, transparent 1px)` 
                  : `linear-gradient(${darkMode ? '#1e293b' : '#e2e8f0'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#1e293b' : '#e2e8f0'} 1px, transparent 1px)`,
                 backgroundSize: bgType === 'dots' ? '24px 24px' : '40px 40px' 
             }} 
           />
          
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 pointer-events-none z-10" />

          {items.map(item => (
            <div 
              key={item.id}
              style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: selectedId === item.id ? 50 : 20 }}
              className={`absolute group ${selectedId === item.id ? 'ring-1 ring-indigo-500' : ''}`}
              onMouseDown={(e) => handleItemMouseDown(e, item)}
              onDoubleClick={() => { if(!['line', 'arrow', 'drawing'].includes(item.type)) { setEditingId(item.id); setSelectedId(item.id); } }}
            >
              {item.type === 'image' && <img src={item.src} alt="Upload" className="w-full h-full object-cover rounded pointer-events-none select-none" />}

              {!['line', 'arrow', 'image', 'drawing'].includes(item.type) && (
                <textarea
                  className={`w-full h-full resize-none outline-none bg-transparent p-4 text-center leading-relaxed ${item.type === 'text' ? (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200') + ' rounded shadow-sm border' : ''} ${editingId !== item.id ? 'pointer-events-none' : 'pointer-events-auto cursor-text'}`}
                  style={{ 
                      fontSize: `${item.fontSize || 16}px`, 
                      fontWeight: item.fontWeight || 'normal', 
                      color: (item.fontColor || (item.type === 'text' ? (darkMode ? '#f8fafc' : '#1e293b') : '#ffffff')) 
                  }}
                  value={item.text}
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  readOnly={editingId !== item.id}
                />
              )}

              {selectedId === item.id && !['drawing'].includes(item.type) && (
                <>
                  <ResizeHandle pos="top-left" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: item.id, handle: 'top-left' }); }} />
                  <ResizeHandle pos="top-right" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: item.id, handle: 'top-right' }); }} />
                  <ResizeHandle pos="bottom-left" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: item.id, handle: 'bottom-left' }); }} />
                  <ResizeHandle pos="bottom-right" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: item.id, handle: 'bottom-right' }); }} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon, onClick, label, dark }) => (
  <button onClick={onClick} title={label} className={`p-2 rounded-xl transition-all ${dark ? 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400' : 'hover:bg-slate-100 text-slate-600 hover:text-indigo-600'}`}>{icon}</button>
);

const ResizeHandle = ({ pos, onMouseDown }) => {
  const cursor = pos.includes('top') ? 'ns-resize' : 'ew-resize';
  const style = pos === 'top-left' ? '-top-1.5 -left-1.5' : pos === 'top-right' ? '-top-1.5 -right-1.5' : pos === 'bottom-left' ? '-bottom-1.5 -left-1.5' : '-bottom-1.5 -right-1.5';
  return <div onMouseDown={onMouseDown} className={`absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full shadow z-50 cursor-move ${style}`} />;
};

export default Board;