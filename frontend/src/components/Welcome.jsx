import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Welcome = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Creative';

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 5500);
        return () => clearTimeout(timer);
    }, [navigate]);

    // Draw SVG paths animation
    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i) => ({
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: i * 0.4, type: 'spring', duration: 2, bounce: 0 },
                opacity: { delay: i * 0.4, duration: 0.1 },
            },
        }),
    };

    // Words split for staggered reveal
    const phrase = `WELCOME ${userName} TO REECHO MEDIA`;
    const words = phrase.split(' ');

    return (
        <div
            className="relative min-h-screen flex items-center justify-center overflow-hidden p-4"
            style={{
                backgroundColor: '#0a0a0a',
                backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
                backgroundSize: '28px 28px',
            }}
        >
            {/* ---- BACKGROUND SKETCH ICONS ---- */}

            {/* Lightbulb - top left, bobbing */}
            <motion.div
                className="absolute top-10 left-10 md:top-20 md:left-24 text-amber-400 w-20 h-20 md:w-28 md:h-28"
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <motion.path custom={0} variants={draw} initial="hidden" animate="visible" d="M9 18h6" />
                    <motion.path custom={0.5} variants={draw} initial="hidden" animate="visible" d="M10 22h4" />
                    <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.79 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
                    <motion.path custom={1.5} variants={draw} initial="hidden" animate="visible" d="M12 2v2" />
                </motion.svg>
            </motion.div>

            {/* Paper plane - top right, diagonal float */}
            <motion.div
                className="absolute top-10 right-10 md:top-20 md:right-24 text-rose-400 w-20 h-20 md:w-28 md:h-28"
                animate={{ y: [0, -14, 0], x: [0, 10, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M22 2L11 13" />
                    <motion.path custom={2.5} variants={draw} initial="hidden" animate="visible" d="M22 2l-7 20-4-9-9-4 20-7z" />
                </motion.svg>
            </motion.div>

            {/* Gear - bottom left, spinning */}
            <motion.div
                className="absolute bottom-10 left-10 md:bottom-20 md:left-24 text-slate-400 w-20 h-20 md:w-28 md:h-28 opacity-70"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
                <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <motion.circle custom={0.5} variants={draw} initial="hidden" animate="visible" cx="12" cy="12" r="3" />
                    <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 4.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 .33 1.65 1.65 0 0 0 10 1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </motion.svg>
            </motion.div>

            {/* Bar chart - bottom right, bobbing */}
            <motion.div
                className="absolute bottom-10 right-10 md:bottom-20 md:right-24 text-emerald-400 w-20 h-20 md:w-28 md:h-28 opacity-80"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <motion.path custom={1} variants={draw} initial="hidden" animate="visible" d="M3 3v18h18" />
                    <motion.path custom={1.5} variants={draw} initial="hidden" animate="visible" d="M18 17V9" />
                    <motion.path custom={2} variants={draw} initial="hidden" animate="visible" d="M13 17V5" />
                    <motion.path custom={2.5} variants={draw} initial="hidden" animate="visible" d="M8 17v-3" />
                </motion.svg>
            </motion.div>

            {/* ---- MAIN CARD ---- */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
                className="relative z-10 w-full max-w-xl text-center bg-[#0a0a0a] p-10 md:p-14 border-2 border-white rounded-xl"
                style={{ boxShadow: '10px 10px 0px 0px rgba(255,255,255,1)' }}
            >
                {/* Post-it tape on top */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-indigo-500 border border-white rotate-2 origin-center"
                />

                {/* Word-by-word heading */}
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wide mb-6 leading-tight">
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            className="inline-block mr-3"
                            initial={{ opacity: 0, y: -30, rotate: -10 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            transition={{ type: 'spring', bounce: 0.5, delay: i * 0.12 }}
                        >
                            {word === userName
                                ? <span className="text-indigo-400">{word}</span>
                                : word}
                        </motion.span>
                    ))}
                </h1>

                {/* Divider line */}
                <motion.div
                    className="w-0 h-0.5 bg-white mx-auto"
                    animate={{ width: '4rem' }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                />

                {/* Subtitle */}
                <motion.p
                    className="mt-6 font-mono text-gray-400 text-sm md:text-base uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                >
                    Enjoy your work in workspace
                </motion.p>

                <motion.p
                    className="mt-3 font-black text-xl md:text-2xl text-indigo-400 uppercase tracking-wider"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.4, type: 'spring', bounce: 0.5 }}
                >
                    Be Creative. Be Productive.
                </motion.p>

                {/* Loading indicator */}
                <motion.p
                    className="mt-10 text-white font-mono text-xs uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 3.5, duration: 1.5, repeat: Infinity }}
                >
                    [ Preparing your boards... ]
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Welcome;
