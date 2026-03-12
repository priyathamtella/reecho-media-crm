import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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

      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="flex flex-col items-center bg-[#F4F4FA]"
      >
        <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 bg-[#F3E8FF] rounded-none sm:rounded-[32px] overflow-hidden mb-16 relative mt-16">
          <motion.div variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 w-full">
             <h2 className="text-4xl md:text-[3.5rem] lg:text-[4.5rem] font-black uppercase tracking-tight leading-[0.9] mb-16 text-[#000000]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
               BELIEVE IN WHAT WE DO?<br/>
               COME SAY HI!
             </h2>

             <div className="w-full h-[1px] bg-[#000000]/20 mb-8 max-w-sm"></div>
             
             <a href="mailto:priyathamtella@gmail.com" className="flex items-center gap-4 text-xl font-medium text-[#000000] hover:text-[#C4B5FD] transition-colors group mb-12 w-fit">
               Join our journey 
               <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </a>

             <p className="text-base md:text-lg font-medium text-[#000000]/70 max-w-md leading-relaxed">
               We love connecting with ambitious founders, passionate creators, and innovative brands. Let's start a conversation and see where it leads!
             </p>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="relative w-full h-full min-h-[400px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
              alt="Team at Coworking Space"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
