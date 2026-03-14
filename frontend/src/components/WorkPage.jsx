import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

const WorkPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-x-hidden selection:bg-[var(--text)] selection:text-[var(--brand)] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-16 px-6">
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-medium uppercase text-[var(--text)] tracking-tighter leading-none" style={{ fontFamily: 'serif' }}>
              OUR WORK
            </h1>
            <p className="mt-6 text-sm md:text-lg text-[var(--text-secondary)] font-semibold uppercase tracking-[0.3em]">A curated archive of creative excellence.</p>
        </motion.div>

        <motion.section 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="px-6 max-w-7xl mx-auto overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <motion.div variants={fadeInUp} className="group relative rounded-[48px] overflow-hidden aspect-square md:w-[60%] cursor-pointer border border-[var(--border)] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-easeInOut grayscale group-hover:grayscale-0" alt="Major Case Study" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--text)]/80 via-transparent flex flex-col justify-end p-12 text-white">
                <h3 className="text-4xl md:text-6xl font-medium uppercase mb-2" style={{ fontFamily: 'serif' }}>PROJECT ALPHA</h3>
                <p className="text-sm font-semibold tracking-[0.2em] bg-[var(--brand)] w-fit px-6 py-2 rounded-full uppercase mt-2 shadow-lg">Strategy & Design</p>
              </div>
            </motion.div>
            <div className="flex flex-col gap-8 md:w-[40%]">
              <motion.div variants={fadeInUp} className="group relative rounded-[40px] overflow-hidden w-full h-[50%] cursor-pointer border border-[var(--border)] shadow-xl">
                <img src="https://images.unsplash.com/photo-1541462608141-ad60397d4bc7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-easeInOut grayscale group-hover:grayscale-0" alt="Secondary Work" />
                <div className="absolute inset-0 bg-[var(--text)]/40 group-hover:bg-[var(--text)]/60 transition-colors duration-500 flex items-center justify-center pointer-events-none">
                  <div className="bg-[var(--accent)] p-6 rounded-full text-[var(--text)] shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
              </motion.div>
              <Link to="/work/our-photography" className="block h-[50%]">
                <motion.div variants={fadeInUp} className="bg-[var(--brand)] relative rounded-[40px] overflow-hidden w-full h-full cursor-pointer flex flex-col items-center justify-center p-10 text-white shadow-xl hover:scale-[1.02] transition-all duration-500 group">
                    <h3 className="text-4xl md:text-5xl font-medium uppercase text-center leading-none tracking-tighter" style={{ fontFamily: 'serif' }}>View <br/> Archive</h3>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      {/* CTA SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="px-6 pb-24"
      >
        <div className="max-w-7xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <motion.div variants={fadeInUp} className="flex flex-col justify-center p-12 md:p-24 z-10 w-full flex-1">
             <h2 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter leading-none mb-12 text-[var(--text)]" style={{ fontFamily: 'serif' }}>
               INSPIRED BY<br/>OUR WORK?
             </h2>
             <Link to="/contact" className="flex items-center gap-4 bg-[var(--brand)] text-white px-10 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-transform group shadow-xl w-fit">
               Start Your Project <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative flex-1 min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" 
              alt="Creative Data"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default WorkPage;
