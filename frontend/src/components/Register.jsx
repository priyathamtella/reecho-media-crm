import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // --- LOGIC SECTION (Untouched) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Hits app.Post("/register", controllers.Register) in your Go backend
      const response = await axios.post('http://localhost:5050/register', {
        name,
        email,
        password // Will be hashed via bcrypt on the backend
      });

      if (response.data.token) {
        // Store JWT for future authenticated requests
        localStorage.setItem('token', response.data.token);
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
      }

      // Always go to login on successful registration
      window.location.href = '/login';

    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
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
  const bgColor = isDarkMode ? '#0a0a0a' : '#ffffff';
  const dotColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* Main Container with dynamic dot background */}
      <div
        className="relative min-h-screen flex items-center justify-center transition-colors duration-500 overflow-hidden p-4"
        style={{
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px'
        }}
      >

        {/* --- DARK MODE TOGGLE --- */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 z-50 p-3 rounded-full border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </motion.svg>
            ) : (
              <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* --- BACKGROUND SKETCH ANIMATIONS (8 Icons) --- */}

        {/* 1. Lightbulb (Idea) */}
        <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 md:top-20 md:left-24 text-amber-500 w-16 h-16 md:w-24 md:h-24 opacity-80">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M9 18h6" />
            <motion.path custom={1.5} variants={draw} initial="hidden" animate="visible" d="M10 22h4" />
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.79 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
            <motion.path custom={2.5} variants={draw} initial="hidden" animate="visible" d="M12 2v2" />
          </motion.svg>
        </motion.div>

        {/* 2. Cloud (Storage/Sync) */}
        <motion.div animate={{ x: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute top-16 right-32 text-sky-400 w-24 h-24 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </motion.svg>
        </motion.div>

        {/* 3. Paper Plane (Launch) */}
        <motion.div animate={{ y: [0, -15, 0], x: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-10 md:bottom-20 md:right-24 text-rose-400 w-16 h-16 md:w-24 md:h-24 opacity-80">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M22 2L11 13" />
            <motion.path custom={3} variants={draw} initial="hidden" animate="visible" d="M22 2l-7 20-4-9-9-4 20-7z" />
          </motion.svg>
        </motion.div>

        {/* 4. Gear (System/Process) */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute bottom-10 left-10 md:bottom-20 md:left-24 text-slate-400 w-16 h-16 md:w-24 md:h-24 opacity-60">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.circle custom={1} variants={draw} initial="hidden" animate="visible" cx="12" cy="12" r="3" />
            <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </motion.svg>
        </motion.div>

        {/* 5. Clipboard (Tasks) */}
        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:block absolute top-1/2 left-12 -translate-y-1/2 text-emerald-500 w-20 h-20 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <motion.rect custom={2} variants={draw} initial="hidden" animate="visible" x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <motion.path custom={3} variants={draw} initial="hidden" animate="visible" d="M9 14h6" /><motion.path custom={3.5} variants={draw} initial="hidden" animate="visible" d="M9 18h6" /><motion.path custom={4} variants={draw} initial="hidden" animate="visible" d="M9 10h6" />
          </motion.svg>
        </motion.div>

        {/* 6. Magnifying Glass (Search) */}
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:block absolute top-1/2 right-12 -translate-y-1/2 text-purple-400 w-20 h-20 opacity-70">
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <motion.circle custom={1} variants={draw} initial="hidden" animate="visible" cx="11" cy="11" r="8" />
            <motion.line custom={2} variants={draw} initial="hidden" animate="visible" x1="21" y1="21" x2="16.65" y2="16.65" />
          </motion.svg>
        </motion.div>

        {/* 7. Coffee Cup (Fuel) */}
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

        {/* --- MAIN REGISTER CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-[#0a0a0a] p-8 md:p-10 border-2 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-colors duration-500"
        >
          {/* Post-it tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-300 dark:bg-yellow-500 border border-black dark:border-white rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"></div>

          <form onSubmit={handleRegister} className="flex flex-col">
            <div className="text-center mb-10 relative">
              <h2 className="text-3xl font-black text-black dark:text-white mb-2 uppercase tracking-wide transition-colors duration-300">
                Join Reecho Media
              </h2>

              {/* Sketched Squiggly Underline */}
              <motion.svg className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-4 text-indigo-500" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M 5 5 Q 15 0 25 5 T 45 5 T 65 5 T 85 5 T 95 5" />
              </motion.svg>

              <p className="text-gray-600 dark:text-gray-400 font-medium font-mono text-sm mt-4 transition-colors duration-300">
                // Organize your creative projects
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1 transition-colors duration-300">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-[#121212] border-2 border-black dark:border-white text-black dark:text-white rounded-lg outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1 transition-colors duration-300">Email Address</label>
                <input
                  type="email"
                  placeholder="name@project.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-[#121212] border-2 border-black dark:border-white text-black dark:text-white rounded-lg outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1 transition-colors duration-300">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-[#121212] border-2 border-black dark:border-white text-black dark:text-white rounded-lg outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translate: "-2px -2px", boxShadow: isDarkMode ? "6px 6px 0px 0px rgba(255,255,255,1)" : "6px 6px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ scale: 0.98, translate: "2px 2px", boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
              className="w-full mt-8 p-3 bg-indigo-500 border-2 border-black dark:border-white text-white dark:text-black dark:bg-indigo-400 rounded-lg font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              Create Account
            </motion.button>

            <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">
              Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline decoration-2 underline-offset-4">Sign In</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;