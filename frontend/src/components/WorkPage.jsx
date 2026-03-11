import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const WorkPage = () => {
  const dummyImages = [
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800"
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F4F4FA] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#0F172A] selection:text-[#C4B5FD] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-16 px-4">
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black uppercase text-[#0F172A] tracking-tighter" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>
              OUR WORK
            </h1>
            <p className="mt-6 text-xl text-[#0F172A]/70 font-medium font-bold uppercase tracking-widest">A curated archive of creative excellence.</p>
        </motion.div>

        <motion.section 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="px-4 max-w-[1600px] mx-auto overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <motion.div variants={fadeInUp} className="group relative rounded-[32px] overflow-hidden aspect-square md:w-[60%] cursor-pointer border-4 border-white shadow-xl">
              <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-easeInOut" alt="Major Case Study" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent flex flex-col justify-end p-12 text-[#F4F4FA] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h3 className="text-5xl font-black uppercase mb-2" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>Project Alpha</h3>
                <p className="text-lg text-[#F4F4FA]/80 bg-[#C4B5FD]/20 backdrop-blur-sm w-fit px-6 py-2 rounded-full uppercase mt-4 text-sm font-bold tracking-[0.2em]">Strategy & Design</p>
              </div>
            </motion.div>
            <div className="flex flex-col gap-8 md:w-[40%]">
              <motion.div variants={fadeInUp} className="group relative rounded-[32px] overflow-hidden w-full h-[50%] cursor-pointer">
                <img src="https://images.unsplash.com/photo-1541462608141-ad60397d4bc7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-easeInOut" alt="Secondary Work" />
                <div className="absolute inset-0 bg-[#0F172A]/20 group-hover:bg-[#0F172A]/60 transition-colors duration-500 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#C4B5FD] p-6 rounded-full text-[#0F172A] backdrop-blur-sm shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500 ease-easeInOut">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-[#0F172A] relative rounded-[32px] overflow-hidden w-full h-[50%] cursor-pointer flex flex-col items-center justify-center p-10 text-[#C4B5FD] border-b-8 border-[#C4B5FD] hover:bg-[#C4B5FD] hover:text-[#0F172A] transition-all duration-500 group">
                  <h3 className="text-4xl md:text-5xl font-black uppercase text-center leading-none group-hover:scale-105 transition-transform" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>View <br/> Archive</h3>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default WorkPage;
