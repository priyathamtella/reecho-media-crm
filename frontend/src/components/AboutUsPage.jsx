import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

const AboutUsPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#F4F4FA] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#0F172A] selection:text-[#C4B5FD] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <motion.section 
          id="about" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pt-16 pb-24 px-4 bg-[#F4F4FA] w-full relative z-30"
        >
          <div className="text-center mb-16 relative w-full overflow-hidden">
            <h1 className="text-[12vw] md:text-8xl lg:text-[140px] font-black uppercase text-[#0F172A] tracking-tight leading-none" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>
              ABOUT US
            </h1>
            <p className="mt-8 text-xl max-w-2xl mx-auto text-[#0F172A]/70 font-medium">We are a team of visionary creators, strategic thinkers, and digital pioneers dedicated to shaping the future of media.</p>
          </div>

          <div className="flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 mt-12 gap-16">
            <motion.div variants={fadeInUp} className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>
                    Who We Are
                </h3>
                <p className="text-lg md:text-2xl text-[#0F172A]/70 font-medium leading-relaxed">
                    Reecho Media is an independent creative agency based in Mumbai. We specialise in branding, web development, motion graphics, and art direction to bring high-calibre ideas to life. <br/><br/>
                    Our focus is on building experiences that not only look incredible but also drive measurable growth and scale with digital strategy.
                </p>
                <div className="mt-10 flex gap-12">
                   <div>
                     <p className="text-4xl font-black text-[#C4B5FD]" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>150+</p>
                     <p className="text-xs font-bold uppercase tracking-widest text-[#0F172A]/50 mt-1">Projects Done</p>
                   </div>
                   <div>
                     <p className="text-4xl font-black text-[#C4B5FD]" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>50+</p>
                     <p className="text-xs font-bold uppercase tracking-widest text-[#0F172A]/50 mt-1">Happy Clients</p>
                   </div>
                </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="md:w-1/2 relative rounded-[40px] overflow-hidden align-middle border-8 border-white shadow-2xl">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Team at Work" className="w-full h-full object-cover aspect-video md:aspect-square group-hover:scale-105 transition-transform duration-700 ease-easeInOut"/>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
