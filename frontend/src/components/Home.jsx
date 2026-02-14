import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  LayoutGrid, Plus, Search, User, LogOut, Settings, 
  MoreVertical, Clock, Loader2 
} from "lucide-react";

const Home = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const navigate = useNavigate();
  const menuRef = useRef(null);

  // 1. Fetch Boards (Force Refresh)
  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      // Add timestamp (?t=...) to force the browser to get fresh data from Go
      const response = await axios.get(`http://localhost:5050/api/boards?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(response.data);
    } catch (err) {
      console.error("Error fetching boards:", err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();

    // Close profile menu on outside click
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Create Board Logic
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5050/api/boards", 
        { title: newTitle }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Immediately update local state so we see it without refresh
      setBoards([...boards, response.data]); 
      setShowModal(false);
      setNewTitle("");
      
      // Go directly to the new board
      navigate(`/boards/${response.data.ID}`);
    } catch (err) {
      alert("Failed to create board. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F0F4F8] text-slate-400 gap-2">
      <Loader2 className="animate-spin" /> Loading Workspace...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-indigo-200 shadow-lg">
            <LayoutGrid size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">Reecho Workspace</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all w-96">
          <Search size={18} className="text-slate-400 mr-2" />
          <input type="text" placeholder="Search your boards..." className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder-slate-400" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-300"
          >
            <Plus size={16} /> New Board
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 hover:ring-2 hover:ring-indigo-200 transition-all"
            >
              <User size={20} />
            </button>

            {/* Menu Popup */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-sm font-bold text-slate-800">My Account</p>
                  <p className="text-xs text-slate-500">user@example.com</p>
                </div>
                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Settings size={16} /> Profile Settings
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Boards</h1>
            <p className="text-slate-500 mt-1">Select a project to start designing</p>
          </div>
          {/* Mobile FAB */}
          <button onClick={() => setShowModal(true)} className="md:hidden bg-indigo-600 text-white p-4 rounded-full shadow-xl fixed bottom-6 right-6 z-40">
            <Plus size={24} />
          </button>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* "Create New" Card */}
          <div onClick={() => setShowModal(true)} className="group border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 mb-3 transition-colors">
              <Plus size={24} />
            </div>
            <p className="font-bold text-slate-500 group-hover:text-indigo-600">Create New Board</p>
          </div>

          {/* Actual Board Cards */}
          {boards.map((board) => (
            <div 
              key={board.ID} 
              onClick={() => navigate(`/boards/${board.ID}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              {/* Board Thumbnail Preview */}
              <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 relative overflow-hidden border border-slate-100">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-700">Open</span>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg truncate w-40">{board.Title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Clock size={12} />
                    <span>Last updated {new Date(board.UpdatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <p>No boards found. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* --- CREATE BOARD MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Create New Board</h2>
            <p className="text-sm text-slate-500 mb-6">Give your project a name.</p>
            <form onSubmit={handleCreateBoard}>
              <input 
                autoFocus type="text" placeholder="e.g. Marketing Campaign"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 mb-6 font-medium"
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black">Create Board</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;