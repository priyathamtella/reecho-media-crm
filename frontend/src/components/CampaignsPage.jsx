import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

const CampaignsPage = () => {
  const dummyImages = [
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800"
  ];

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
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-16 px-4">
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black uppercase text-[#0F172A] tracking-tighter" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>
              CAMPAIGNS
            </h1>
            <p className="mt-6 text-xl text-[#0F172A]/70 font-medium">Stories that matter, scaled with digital precision.</p>
        </motion.div>

        <motion.section 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="px-4 max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            { title: "Dynamic Brand", src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0" },
            { title: "Market Growth", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f" },
            { title: "Creative Pulse", src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174" },
            { title: "Social Impact", src: "https://images.unsplash.com/photo-1533750349088-cd871a92f312" },
            { title: "Team Vision", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f" },
            { title: "Vibrant Hub", src: "https://images.unsplash.com/photo-1493770348161-369560ae357d" }
          ].map((item, i) => (
             <motion.div key={i} variants={fadeInUp} className="group relative rounded-[32px] overflow-hidden aspect-square cursor-pointer border border-[#0F172A]/5">
              <img src={item.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-easeInOut" alt={item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent flex flex-col justify-end p-8 text-[#F4F4FA] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h3 className="text-3xl font-black uppercase" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>{item.title}</h3>
                <p className="text-xs font-bold tracking-widest uppercase mt-2 text-[#C4B5FD]">Case Study</p>
              </div>
            </motion.div>
          ))}
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignsPage;
