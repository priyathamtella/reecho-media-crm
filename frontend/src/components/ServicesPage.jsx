import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

const ServicesPage = () => {
  const dummyImages = [
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1621619856624-42fd193a0661?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=800"
  ];

  const services = [
    { title: "VIDEOGRAPHY", desc: "We create content that connects with your audience - built on strategy, guided by insight, and designed to deliver across platforms.", src: dummyImages[1] }, 
    { title: "WEBSITE DESIGN & DEVELOPMENT", desc: "We design user experiences that are intuitive, goal-driven, and built around real user behavior - turning complexity into clarity.", src: dummyImages[2] }, 
    { title: "CGI AND ANIMATION", desc: "We create sharp, visual content through motion and 3D - built to explain, engage, and stand out across brand and product.", src: dummyImages[4] }, 
    { title: "PHOTOGRAPHY", desc: "We create content that speaks to your audience and solves for their needs - rooted in strategy, shaped by insight.", src: dummyImages[3] }
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
    <div className="min-h-screen bg-[#F4F4FA] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#C4B5FD] selection:text-[#F4F4FA] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <motion.section 
          id="services" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pt-16 pb-24 px-4 bg-[#F4F4FA] w-full relative z-30"
        >
          <div className="text-center mb-16 relative w-full overflow-hidden">
            <h1 className="text-[12vw] md:text-8xl lg:text-[140px] font-black uppercase text-[#0F172A] tracking-tight leading-none" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>
              OUR EXPERTISE
            </h1>
            <p className="mt-8 text-xl max-w-2xl mx-auto text-[#0F172A]/70 font-medium">From strategic foundations to fully interactive websites and world-class video production, here is what we do best.</p>
          </div>

          <div className="flex flex-col w-full px-4 md:px-12 mt-12 gap-4">
            {services.map((service, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="group relative w-full h-[100px] md:h-[120px] hover:h-[300px] md:hover:h-[450px] transition-all duration-700 ease-in-out cursor-pointer overflow-hidden transform hover:-skew-y-2 hover:scale-[1.01]"
              >
                 <div className="absolute inset-0 bg-[#C4B5FD] group-hover:bg-[#0F172A] transition-colors duration-500 z-10 w-full h-full"></div>
                 
                 <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 w-full h-full">
                    <img src={service.src} alt={service.title} className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                 </div>

                 <div className="relative z-20 w-full h-full flex flex-col md:flex-row justify-between items-start md:items-center px-8 md:px-16 py-6 md:py-auto text-[#F4F4FA]">
                    <h3 className="text-xl md:text-3xl lg:text-4xl font-black uppercase md:w-[35%]" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>
                      {service.title}
                    </h3>
                    <div className="md:w-[60%] overflow-hidden h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-4 md:group-hover:mt-0 transition-all duration-700 ease-in-out">
                       <p className="text-sm md:text-lg font-medium leading-relaxed bg-[#0F172A]/40 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                         {service.desc}
                       </p>
                    </div>
                 </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
