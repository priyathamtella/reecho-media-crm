import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ServicesPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleService = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const dummyImages = [
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1621619856624-42fd193a0661?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=800"
  ];

  const services = [
    { title: "Brand Activations", desc: "We bring your brand to life through immersive experiences and strategic activations. Engaging your target audience directly to create memorable moments and drive deep brand loyalty." },
    { title: "360° Digital Marketing", desc: "A comprehensive digital marketing approach that covers all touchpoints. We ensure your brand's presence is felt across search, social, email, and performance channels, creating a unified narrative that drives results." },
    { title: "Content Creation", desc: "From engaging copy to eye-catching visuals, we craft content that resonates with your audience. Our storytelling approach helps build authentic connections and keeps your brand top of mind. Whether for social, blogs, or campaigns, content is king." },
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
        
        {/* COMPREHENSIVE SOLUTIONS SECTION */}
        <section className="bg-[#F4F4FA] py-4 md:py-10 px-4 w-full relative z-30 mb-8 md:mb-16 mt-8">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase text-[#0F172A] text-center mb-10 tracking-tight" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
              THE ARCHITECTURE OF IMPACT
            </h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium text-sm md:text-[17px]">
              {solutions.map((item, idx) => (
                <div key={idx} className="bg-[#0F172A] text-[#F4F4FA] hover:bg-[#C4B5FD] hover:text-[#0F172A] hover:scale-105 transition-all duration-300 cursor-pointer px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_4px_0_0_#020617] hover:shadow-[0_4px_0_0_#8B5CF6] active:shadow-none active:translate-y-1">
                  <span className="text-xl md:text-2xl">{item.emoji}</span>
                  <span className="tracking-wide font-bold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <motion.section 
          id="services" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pt-8 pb-24 px-4 max-w-6xl mx-auto w-full relative z-30"
        >
          <div className="text-center mb-16 relative w-full overflow-hidden">
            <h1 className="text-[12vw] md:text-[100px] lg:text-[120px] font-black uppercase text-[#2B2B2B] tracking-tight leading-none" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
              SERVICES
            </h1>
          </div>

          <div className="flex flex-col w-full md:px-12 mt-8 gap-4">
            {services.map((service, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div 
                  key={i} 
                  variants={fadeInUp}
                  onClick={() => toggleService(i)}
                  className="w-full bg-[#93CDEB] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col"
                >
                   <div className="flex justify-between items-center px-8 md:px-12 py-5 md:py-6">
                      <h3 className="text-xl md:text-[22px] font-bold text-[#1E293B]">
                        {service.title}
                      </h3>
                      <span className="text-2xl md:text-3xl font-light text-[#1E293B] transition-transform duration-300">
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
                          <div className="px-8 md:px-12 pb-6 md:pb-8">
                             <p className="text-base md:text-lg text-[#1E293B]/80 max-w-3xl leading-relaxed">
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

      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="flex flex-col items-center bg-[#F4F4FA]"
      >
        <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 bg-[#FDF2E9] rounded-none sm:rounded-[32px] overflow-hidden mb-16 relative mt-16">
          <motion.div variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 w-full">
             <h2 className="text-4xl md:text-[3.5rem] lg:text-[4.5rem] font-black uppercase tracking-tight leading-[0.9] mb-16 text-[#000000]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
               READY TO ELEVATE YOUR BRAND?<br/>
               LET'S TALK SERVICES.
             </h2>

             <div className="w-full h-[1px] bg-[#000000]/20 mb-8 max-w-sm"></div>
             
             <a href="mailto:priyathamtella@gmail.com" className="flex items-center gap-4 text-xl font-medium text-[#000000] hover:text-[#C4B5FD] transition-colors group mb-12 w-fit">
               Let's connect 
               <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </a>

             <p className="text-base md:text-lg font-medium text-[#000000]/70 max-w-md leading-relaxed">
               Discover how our tailored, multidisciplinary approach can streamline your creative process and push your business forward. We’re ready when you are.
             </p>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="relative w-full h-full min-h-[400px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200" 
              alt="Workspace"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
