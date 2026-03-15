import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save, Loader2, ArrowLeft, Link as LinkIcon, FileText,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Type, Heading1, Heading2, Minus, ExternalLink,
    Trash2, X, Check, Share2, Send
} from "lucide-react";
import ShareModal from "./ShareModal";

const API = "http://localhost:5050/api";

const DocumentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doc, setDoc] = useState(null);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
    const [loading, setLoading] = useState(true);
    const [isDark] = useState(() => localStorage.getItem("theme") === "dark");
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [boards, setBoards] = useState([]);
    const [linkedBoardId, setLinkedBoardId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [linkedTaskId, setLinkedTaskId] = useState(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSent, setReviewSent] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const userRole = localStorage.getItem("userRole") || "admin";
    const editorRef = useRef(null);
    const saveTimer = useRef(null);

    const dm = isDark;

    // ── FETCH DOC ───────────────────────────────
    useEffect(() => {
        const fetchDocAndRelated = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                
                // Fetch Doc
                const res = await axios.get(`${API}/docs/${id}?t=${Date.now()}`, { headers });
                const dData = res.data.doc || res.data;
                setDoc(dData);
                setTitle(dData.title);
                setLinkedBoardId(dData.linkedBoardId || null);
                setLinkedTaskId(dData.linkedTaskId || null);
                
                if (editorRef.current) {
                    editorRef.current.innerHTML = dData.content || "<p>Start writing your document here...</p>";
                }
                
                // Permissions
                const role = localStorage.getItem("userRole");
                const permission = res.data.permission || "viewer";
                if (role === "admin" || permission === "editor") {
                    setCanEdit(true);
                } else {
                    setCanEdit(false);
                }
                
                // Related data
                const [rBoards, rTasks] = await Promise.all([
                    axios.get(`${API}/boards`, { headers }),
                    axios.get(`${API}/tasks`, { headers })
                ]);
                setBoards(rBoards.data || []);
                setTasks(rTasks.data || []);
                
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) navigate("/login");
                if (err.response?.status === 404) navigate("/");
            }
        };
        fetchDocAndRelated();
    }, [id, navigate]);



    // ── AUTO-SAVE ────────────────────────────────
    const triggerSave = useCallback((overrideTitle, isImmediate = false) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        
        const saveOperation = async () => {
            setSaveStatus("saving");
            try {
                const token = localStorage.getItem("token");
                const content = editorRef.current?.innerHTML || "";
                await axios.put(`${API}/docs/${id}`, {
                    title: overrideTitle ?? title,
                    content,
                    linkedBoardId: linkedBoardId || "",
                    linkedTaskId: linkedTaskId || "",
                }, { headers: { Authorization: `Bearer ${token}` } });
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2500);
            } catch {
                setSaveStatus("error");
            }
        };

        if (isImmediate) {
            saveOperation();
        } else {
            saveTimer.current = setTimeout(saveOperation, 900);
        }
    }, [id, title, linkedBoardId, linkedTaskId]);

    // ── TOOLBAR COMMANDS ─────────────────────────
    const execCmd = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        triggerSave();
    };

    // ── LINK TO BOARD ────────────────────────────
    const handleLink = async (type, linkId) => {
        if (type === "board") setLinkedBoardId(linkId);
        else if (type === "task") setLinkedTaskId(linkId);

        setShowLinkModal(false);
        setSaveStatus("saving");
        try {
            const token = localStorage.getItem("token");
            const content = editorRef.current?.innerHTML || "";
            await axios.put(`${API}/docs/${id}`, {
                title, content, 
                linkedBoardId: type === 'board' ? (linkId || "") : (linkedBoardId || ""),
                linkedTaskId: type === 'task' ? (linkId || "") : (linkedTaskId || ""),
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch { setSaveStatus("error"); }
    };

    // ── SUBMIT FOR REVIEW (member only) ──────────────
    const handleSubmitReview = async () => {
        setSubmittingReview(true);
        try {
            const token = localStorage.getItem("token");
            await triggerSave();
            // Best-effort notify (endpoint gracefully fails if not available)
            await axios.post(`${API}/docs/${id}/submit-review`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});
            setReviewSent(true);
            setTimeout(() => setReviewSent(false), 3000);
        } finally {
            setSubmittingReview(false);
        }
    };

    // ── DELETE ───────────────────────────────────
    const handleDelete = async () => {
        if (!window.confirm("Delete this document? This cannot be undone.")) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API}/docs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate("/dashboard");
        } catch { alert("Failed to delete document."); }
    };

    if (loading) return (
        <div className={`h-full flex items-center justify-center gap-2 ${dm ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-600"}`}>
            <Loader2 className="animate-spin" /> Loading document...
        </div>
    );

    const linkedBoard = boards.find(b => String(b.ID) === String(linkedBoardId));

    return (
        <div className={`h-full flex flex-col ${dm ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"}`}>

            {/* ── TOPBAR ── */}
            <div className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${dm ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
                        <ArrowLeft size={16} />
                    </button>
                    <FileText size={18} className="text-indigo-500" />

                    {/* Title */}
                    {editingTitle && canEdit ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                className={`text-base font-bold outline-none border-b ${dm ? "bg-transparent border-indigo-400 text-white" : "bg-transparent border-indigo-500 text-slate-900"}`}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onBlur={() => { setEditingTitle(false); triggerSave(title, true); }}
                                onKeyDown={e => { if (e.key === "Enter") { setEditingTitle(false); triggerSave(title, true); } }}
                            />
                            <button onClick={() => { setEditingTitle(false); triggerSave(title, true); }} className="text-emerald-500"><Check size={14} /></button>
                        </div>
                    ) : (
                        <button onClick={() => canEdit && setEditingTitle(true)} className={`text-base font-bold transition-opacity ${dm ? "text-white" : "text-slate-900"} ${canEdit ? "hover:opacity-70" : ""}`}>
                            {title || "Untitled"}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Save status */}
                    <span className={`text-xs font-medium transition-all ${saveStatus === "saving" ? "text-amber-500" : saveStatus === "saved" ? "text-emerald-500" : saveStatus === "error" ? "text-rose-500" : "opacity-0"}`}>
                        {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Save failed" : "·"}
                    </span>

                    {doc?.reviewStatus === "in_review" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold border border-amber-500/20">
                             Under Review
                        </div>
                    )}
                    {doc?.reviewStatus === "approved" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold border border-emerald-500/20">
                             Approved ✓
                        </div>
                    )}

                    {/* Linked board badge */}
                    {linkedBoard && (
                        <Link to={`/boards/${linkedBoard.id}`}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition-colors">
                            <ExternalLink size={11} /> Board: {linkedBoard.title.slice(0, 16)}
                        </Link>
                    )}

                    {/* Linked task badge */}
                    {linkedTaskId && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold">
                             Task: {tasks.find(t => String(t.id) === String(linkedTaskId))?.title.slice(0, 16) || "Linked"}
                        </div>
                    )}

                    {/* Share (admin only) */}
                    {userRole === "admin" && (
                        <button onClick={() => setShowShareModal(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${dm ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                            <Share2 size={13} /> Share
                        </button>
                    )}

                    {/* Submit for Review (member only) */}
                    {userRole === "member" && (
                        <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || reviewSent || doc?.reviewStatus === "approved"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                reviewSent || doc?.reviewStatus === "approved"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-violet-600 hover:bg-violet-700 text-white"
                            }`}>
                            {submittingReview ? <Loader2 size={13} className="animate-spin" /> : (reviewSent || doc?.reviewStatus === "approved") ? <Check size={13} /> : <Send size={13} />}
                            {doc?.reviewStatus === "approved" ? "Approved" : reviewSent ? "Sent to Admin!" : "Submit for Review"}
                        </button>
                    )}

                    {/* Approve button (admin only) */}
                    {userRole === "admin" && doc?.reviewStatus === "in_review" && (
                        <button
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem("token");
                                    await axios.post(`${API}/docs/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                    setDoc(prev => ({ ...prev, reviewStatus: "approved" }));
                                    alert("Document Approved!");
                                } catch { alert("Action failed"); }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                            <Check size={13} /> Approve Doc
                        </button>
                    )}

                    {/* Link to board button */}
                    {canEdit && (
                        <button onClick={() => setShowLinkModal(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${dm ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                            <LinkIcon size={13} /> Link Board/Task
                        </button>
                    )}

                    {/* View Only badge */}
                    {!canEdit && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold">
                            Viewer Mode
                        </div>
                    )}

                    {/* Save */}
                    {canEdit && (
                        <button onClick={() => triggerSave()}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            {saveStatus === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                        </button>
                    )}

                    {/* Delete */}
                    {canEdit && (
                        <button onClick={handleDelete} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── FORMATTING TOOLBAR ── */}
            {canEdit && (
                <div className={`flex flex-wrap items-center gap-0.5 px-6 py-2 border-b flex-shrink-0 ${dm ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <ToolGroup>
                        <FmtBtn icon={<Bold size={14} />} onClick={() => execCmd("bold")} title="Bold" dm={dm} />
                        <FmtBtn icon={<Italic size={14} />} onClick={() => execCmd("italic")} title="Italic" dm={dm} />
                        <FmtBtn icon={<Underline size={14} />} onClick={() => execCmd("underline")} title="Underline" dm={dm} />
                    </ToolGroup>
                    <Sep dm={dm} />
                    <ToolGroup>
                        <FmtBtn icon={<Heading1 size={14} />} onClick={() => execCmd("formatBlock", "h1")} title="Heading 1" dm={dm} />
                        <FmtBtn icon={<Heading2 size={14} />} onClick={() => execCmd("formatBlock", "h2")} title="Heading 2" dm={dm} />
                        <FmtBtn icon={<Type size={14} />} onClick={() => execCmd("formatBlock", "p")} title="Paragraph" dm={dm} />
                    </ToolGroup>
                    <Sep dm={dm} />
                    <ToolGroup>
                        <FmtBtn icon={<List size={14} />} onClick={() => execCmd("insertUnorderedList")} title="Bullet List" dm={dm} />
                        <FmtBtn icon={<ListOrdered size={14} />} onClick={() => execCmd("insertOrderedList")} title="Numbered List" dm={dm} />
                    </ToolGroup>
                    <Sep dm={dm} />
                    <ToolGroup>
                        <FmtBtn icon={<AlignLeft size={14} />} onClick={() => execCmd("justifyLeft")} title="Left" dm={dm} />
                        <FmtBtn icon={<AlignCenter size={14} />} onClick={() => execCmd("justifyCenter")} title="Center" dm={dm} />
                        <FmtBtn icon={<AlignRight size={14} />} onClick={() => execCmd("justifyRight")} title="Right" dm={dm} />
                    </ToolGroup>
                    <Sep dm={dm} />
                    <ToolGroup>
                        {["#1e293b", "#6366f1", "#ef4444", "#10b981", "#f59e0b", "#ec4899"].map(c => (
                            <button key={c} onClick={() => execCmd("foreColor", c)}
                                title="Font color"
                                className="w-5 h-5 rounded-full border-2 border-white shadow hover:scale-125 transition-transform"
                                style={{ backgroundColor: c }} />
                        ))}
                    </ToolGroup>
                    <Sep dm={dm} />
                    <FmtBtn icon={<Minus size={14} />} onClick={() => execCmd("insertHorizontalRule")} title="Divider" dm={dm} />
                </div>
            )}

            {/* ── EDITOR full bleed ── */}
            <div
                ref={editorRef}
                contentEditable={canEdit}
                suppressContentEditableWarning
                onInput={() => triggerSave()}
                className={`flex-1 overflow-y-auto outline-none px-16 py-12 text-base leading-9 ${dm ? "text-slate-100" : "text-slate-800"}`}
                style={{ fontFamily: "'Inter', sans-serif", minHeight: 0 }}
            />
            {/* Global "page" styles injected for contenteditable */}
            <style>{`
        [contenteditable] h1 { font-size: 2em; font-weight: 900; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: 800; margin: 0.4em 0; }
        [contenteditable] ul { list-style: disc; paddingLeft: 1.5em; }
        [contenteditable] ol { list-style: decimal; paddingLeft: 1.5em; }
        [contenteditable] hr { border: none; border-top: 2px solid #e2e8f0; margin: 1em 0; }
        [contenteditable]:empty:before { content: "Start writing..."; opacity: 0.35; }
      `}</style>

            {/* ── LINK BOARD/TASK MODAL ── */}
            <AnimatePresence>
                {showLinkModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border ${dm ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`font-black text-base ${dm ? "text-white" : "text-slate-900"}`}>Link to Board or Task</h3>
                                <button onClick={() => setShowLinkModal(false)} className="text-slate-400"><X size={18} /></button>
                            </div>

                            <p className={`text-[10px] font-bold uppercase text-slate-400 mb-2 mt-4`}>Link to Board</p>
                            <div className="space-y-1 max-h-40 overflow-y-auto mb-4">
                                <button onClick={() => handleLink("board", null)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${!linkedBoardId ? "bg-indigo-600 text-white" : (dm ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100")}`}>
                                    None
                                </button>
                                {boards.map(b => (
                                    <button key={b.id} onClick={() => handleLink("board", b.id)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${String(linkedBoardId) === String(b.id) ? "bg-indigo-600 text-white" : (dm ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100")}`}>
                                        {b.title}
                                    </button>
                                ))}
                            </div>

                            <p className={`text-[10px] font-bold uppercase text-slate-400 mb-2`}>Link to Task</p>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                <button onClick={() => handleLink("task", null)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${!linkedTaskId ? "bg-indigo-600 text-white" : (dm ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100")}`}>
                                    None
                                </button>
                                {tasks.map(t => (
                                    <button key={t.id} onClick={() => handleLink("task", t.id)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${String(linkedTaskId) === String(t.id) ? "bg-indigo-600 text-white" : (dm ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100")}`}>
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── SHARE MODAL (admin only) ── */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                resourceType="doc"
                resourceId={id}
                isDark={dm}
            />
        </div>
    );
};

const ToolGroup = ({ children }) => <div className="flex gap-0.5">{children}</div>;
const Sep = ({ dm }) => <div className={`w-px h-5 mx-1 ${dm ? "bg-slate-700" : "bg-slate-200"}`} />;
const FmtBtn = ({ icon, onClick, title, dm }) => (
    <button onClick={onClick} title={title}
        className={`p-1.5 rounded-lg transition-colors ${dm ? "text-slate-400 hover:bg-slate-700 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
        {icon}
    </button>
);

export default DocumentEditor;
