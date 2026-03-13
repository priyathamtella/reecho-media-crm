import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // --- LOGIC SECTION (Untouched) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5050/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userRole", response.data.user.role || "admin");
        navigate('/welcome');
      }
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  // --- UI SECTION ---
  // Shared transition for the "live drawing" effect
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.3, type: "spring", duration: 2.5, bounce: 0 },
        opacity: { delay: i * 0.3, duration: 0.1 }
      }
    })
  };

  // Dynamic colors for the dot grid
  const bgColor = isDarkMode ? '#020617' : '#f8fafc';
  const dotColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* ── PREMIUM BACKGROUND GLOW ORBS ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        <div className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay opacity-30" style={{
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }} />
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-60 ${isDarkMode ? "bg-indigo-900/50" : "bg-indigo-300/60"}`}></div>
        <div className={`absolute top-40 -right-40 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-50 ${isDarkMode ? "bg-emerald-900/40" : "bg-emerald-300/50"}`}></div>
        <div className={`absolute bottom-[-10%] left-1/3 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-60 ${isDarkMode ? "bg-cyan-900/40" : "bg-cyan-300/50"}`}></div>
      </div>

      {/* Main Container */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 z-10">

        {/* --- DARK MODE TOGGLE --- */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 z-50 p-3 rounded-full text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 shadow-lg backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-400">
                <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </motion.svg>
            ) : (
              <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* --- BACKGROUND SKETCH ANIMATIONS (8 Icons) --- */}
        {/* All icons use text colors that pop against both black and white backgrounds */}

        {/* 1. Top Left: Lightbulb (Idea) */}
        <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 md:top-20 md:left-24 text-amber-500 w-16 h-16 md:w-24 md:h-24 opacity-80">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M9 18h6" />
            <motion.path custom={1.5} variants={draw} initial="hidden" animate="visible" d="M10 22h4" />
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.79 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
            <motion.path custom={2.5} variants={draw} initial="hidden" animate="visible" d="M12 2v2" />
          </motion.svg>
        </motion.div>

        {/* 2. Top Right: Cloud (Storage/Sync) */}
        <motion.div animate={{ x: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute top-16 right-32 text-sky-400 w-24 h-24 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </motion.svg>
        </motion.div>

        {/* 3. Bottom Right: Paper Plane (Launch) */}
        <motion.div animate={{ y: [0, -15, 0], x: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-10 md:bottom-20 md:right-24 text-rose-400 w-16 h-16 md:w-24 md:h-24 opacity-80">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M22 2L11 13" />
            <motion.path custom={3} variants={draw} initial="hidden" animate="visible" d="M22 2l-7 20-4-9-9-4 20-7z" />
          </motion.svg>
        </motion.div>

        {/* 4. Bottom Left: Gear (System/Process) */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute bottom-10 left-10 md:bottom-20 md:left-24 text-slate-400 w-16 h-16 md:w-24 md:h-24 opacity-60">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.circle custom={1} variants={draw} initial="hidden" animate="visible" cx="12" cy="12" r="3" />
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </motion.svg>
        </motion.div>

        {/* 5. Center Left: Clipboard (Tasks) */}
        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:block absolute top-1/2 left-12 -translate-y-1/2 text-emerald-500 w-20 h-20 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <motion.rect custom={2} variants={draw} initial="hidden" animate="visible" x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <motion.path custom={3} variants={draw} initial="hidden" animate="visible" d="M9 14h6" /><motion.path custom={3.5} variants={draw} initial="hidden" animate="visible" d="M9 18h6" /><motion.path custom={4} variants={draw} initial="hidden" animate="visible" d="M9 10h6" />
          </motion.svg>
        </motion.div>

        {/* 6. Center Right: Magnifying Glass (Search) */}
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:block absolute top-1/2 right-12 -translate-y-1/2 text-purple-400 w-20 h-20 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.circle custom={1} variants={draw} initial="hidden" animate="visible" cx="11" cy="11" r="8" />
            <motion.line custom={2} variants={draw} initial="hidden" animate="visible" x1="21" y1="21" x2="16.65" y2="16.65" />
          </motion.svg>
        </motion.div>

        {/* 7. Bottom Center: Coffee Cup (Fuel) */}
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 text-orange-400 w-16 h-16 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <motion.line custom={3} variants={draw} initial="hidden" animate="visible" x1="6" y1="1" x2="6" y2="4" /><motion.line custom={3.2} variants={draw} initial="hidden" animate="visible" x1="10" y1="1" x2="10" y2="4" /><motion.line custom={3.4} variants={draw} initial="hidden" animate="visible" x1="14" y1="1" x2="14" y2="4" />
          </motion.svg>
        </motion.div>

        {/* 8. Arrow pointing to form */}
        <div className="hidden lg:block absolute top-1/4 right-1/4 text-indigo-500 w-24 h-24 opacity-70 rotate-90">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={4} variants={draw} initial="hidden" animate="visible" d="M6 9s4-6 10-2 2 9 2 9" />
            <motion.path custom={5} variants={draw} initial="hidden" animate="visible" d="M15 13l3 3 3-3" />
          </motion.svg>
        </div>

        {/* --- MAIN LOGIN CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-900/60 p-8 md:p-10 border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-colors duration-500"
        >
          <form onSubmit={handleLogin} className="flex flex-col">
            <div className="text-center mb-10 relative">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-2 uppercase tracking-wide">
                Reecho Media
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3">
                Welcome back to your workspace.
              </p>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  placeholder="name@project.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-all duration-200 text-sm placeholder-slate-400 dark:placeholder-slate-600 backdrop-blur-sm"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-all duration-200 text-sm placeholder-slate-400 dark:placeholder-slate-600 backdrop-blur-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/30 transition-all"
            >
              Sign In to Workspace
            </motion.button>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;