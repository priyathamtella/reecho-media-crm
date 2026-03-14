import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ServicesPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleService = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const services = [
    { title: "Brand Activations", desc: "We bring your brand to life through immersive experiences and strategic activations. Engaging your target audience directly to create memorable moments and drive deep brand loyalty." },
    { title: "360° Digital Marketing", desc: "A comprehensive digital marketing approach that covers all touchpoints. We ensure your brand's presence is felt across search, social, email, and performance channels, creating a unified narrative that drives results." },
    { title: "Content Creation", desc: "From engaging copy to eye-catching visuals, we craft content that resonates with your audience. Our storytelling approach helps build authentic connections and keeps your brand top of mind." },
    { title: "3D Animation and CGI", desc: "We create sharp, visual content through motion and 3D - built to explain, engage, and stand out across brand and product. Elevate your storytelling with hyper-realistic rendering and dynamic animation." },
    { title: "Performance Marketing", desc: "Data-driven campaigns designed to deliver measurable ROI. We optimize across platforms to turn clicks into conversions and maximize your growth trajectory." },
    { title: "Website Design and Development", desc: "We design user experiences that are intuitive, goal-driven, and built around real user behavior. From sleek landing pages to complex platforms, we turn complexity into clarity." },
    { title: "Consulting", desc: "Expert guidance to navigate the digital landscape. We provide strategic insights and actionable roadmaps to help you scale, innovate, and overcome your biggest brand challenges." },
    { title: "Designing and Branding", desc: "Crafting distinct visual identities that stand out. We build cohesive brand systems—from logos and typography to comprehensive design languages—that communicate your core values." },
    { title: "Social Media", desc: "Building vibrant online communities. We manage your social presence with tailored content, strategic posting, and active engagement to turn followers into brand advocates." },
    { title: "Hero Campaigns", desc: "We build high-impact campaigns from scratch. From the initial spark of an idea to the final rollout, we manage execution across all platforms to ensure your flagship campaigns stop the scroll and drive action." },
    { title: "Personal Branding", desc: "Elevating your personal story and professional authority. We help leaders and creators build a compelling digital footprint that commands attention and opens new opportunities." }
  ];

  const solutions = [
    { emoji: "📣", text: "Brand Activations" },
    { emoji: "🌐", text: "360° Digital Marketing" },
    { emoji: "🎥", text: "Content Creation" },
    { emoji: "🎞️", text: "3D Animation and CGI" },
    { emoji: "📈", text: "Performance Marketing" },
    { emoji: "👩‍💻", text: "Website Design and Development" },
    { emoji: "💡", text: "Consulting" },
    { emoji: "✏️", text: "Designing and Branding" },
    { emoji: "📱", text: "Social Media" },
    { emoji: "🎬", text: "Hero Campaigns" },
    { emoji: "🗣️", text: "Personal Branding" }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-x-hidden selection:bg-[var(--text)] selection:text-[var(--brand)] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        
        {/* COMPREHENSIVE SOLUTIONS SECTION */}
        <section className="py-12 px-6 w-full relative z-30 mb-8 mt-8">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-6xl font-medium uppercase text-[var(--text)] mb-12 tracking-tighter" style={{ fontFamily: 'serif' }}>
              THE ARCHITECTURE OF IMPACT
            </h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {solutions.map((item, idx) => (
                <div key={idx} className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--brand)] hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer px-6 py-3 rounded-full flex items-center gap-3 shadow-lg group">
                  <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <span className="tracking-wide font-semibold text-sm md:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <motion.section 
          id="services" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pt-8 pb-24 px-6 max-w-6xl mx-auto w-full relative z-30"
        >
          <div className="text-center mb-16 relative w-full overflow-hidden">
            <h1 className="text-[15vw] md:text-[120px] font-medium uppercase text-[var(--text)] tracking-tighter leading-none opacity-5 absolute -top-10 left-0 right-0" style={{ fontFamily: 'serif' }}>
              SERVICES
            </h1>
            <h1 className="text-6xl md:text-8xl font-medium uppercase text-[var(--text)] tracking-tight relative z-10" style={{ fontFamily: 'serif' }}>
              SERVICES
            </h1>
          </div>

          <div className="flex flex-col w-full gap-4">
            {services.map((service, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div 
                  key={i} 
                  variants={fadeInUp}
                  onClick={() => toggleService(i)}
                  className={`w-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col border shadow-md hover:shadow-xl ${isOpen ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--brand)]'}`}
                >
                   <div className="flex justify-between items-center px-8 md:px-12 py-6 md:py-8">
                      <h3 className="text-xl md:text-3xl font-medium uppercase tracking-tight" style={{ fontFamily: 'serif' }}>
                        {service.title}
                      </h3>
                      <span className="text-2xl md:text-4xl font-light transition-transform duration-300 opacity-50">
                        {isOpen ? '−' : '+'}
                      </span>
                   </div>
                   
                   <AnimatePresence initial={false}>
                     {isOpen && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.4, ease: "easeInOut" }}
                       >
                          <div className="px-8 md:px-12 pb-8 md:pb-12">
                             <p className="text-lg md:text-2xl font-medium max-w-4xl leading-relaxed opacity-90 italic">
                               {service.desc}
                             </p>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </motion.div>
              );
            })}
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
               READY TO ELEVATE YOUR BRAND?
             </h2>
             <Link to="/contact" className="flex items-center gap-4 bg-[var(--brand)] text-white px-10 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-transform group shadow-xl w-fit">
               Let's Talk Services <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative flex-1 min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200" 
              alt="Workspace"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
