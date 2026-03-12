import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
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

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <motion.section 
          id="about" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pb-24 w-full relative z-30"
        >
          {/* Header */}
          <div className="text-center mb-24 relative w-full flex flex-col items-center">
            <motion.div variants={fadeInUp} className="bg-[#FAF9F6] border border-[#0F172A]/10 px-4 py-1 flex items-center gap-2 mb-6 rounded shadow-sm">
               <span className="w-1.5 h-1.5 bg-[#C4B5FD] rounded-full"></span>
               <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#0F172A]/70">OUR STORY</span>
               <span className="w-1.5 h-1.5 bg-[#C4B5FD] rounded-full"></span>
            </motion.div>
            <motion.h1 
              variants={fadeInUp} 
              className="text-[10vw] md:text-8xl lg:text-[140px] font-black uppercase text-[#0F172A] tracking-tight leading-[0.9] mb-8" 
              style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}
            >
              ABOUT US
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-2xl md:text-4xl font-black uppercase tracking-widest text-[#C4B5FD]" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>
              Turning Ideas into Impact
            </motion.p>
          </div>

          {/* The Story */}
          <div className="flex flex-col lg:flex-row w-full mt-12 gap-16 lg:gap-24 items-center">
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 flex flex-col justify-center space-y-8">
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
                    Every brand begins with a story.<br/>
                    <span className="text-[#C4B5FD]">Reecho Media began with a dream.</span>
                </h3>
                
                <div className="space-y-6 text-lg md:text-xl text-[#0F172A]/80 font-medium leading-relaxed">
                  <p>
                    Hi, I'm <span className="text-[#0F172A] font-bold">Priyatham</span>. While most students were focused only on completing their degrees, I had a different vision. During the second year of my BSc, I noticed something important — many talented businesses and creators had great ideas but struggled to communicate them to the world.
                  </p>
                  <div className="p-8 bg-white border-l-4 border-[#C4B5FD] rounded-r-2xl shadow-lg my-8 italic">
                    <p className="text-2xl font-bold text-[#0F172A]">
                      "What if strategy and creativity could help these ideas reach the people who need them most?"
                    </p>
                  </div>
                  <p>
                    And that's how Reecho Media was born.
                  </p>
                  <p>
                    What started as my passion project quickly grew into a platform focused on marketing planning, brand strategy, and digital growth. Built on curiosity, experimentation, and late nights of learning, Reecho Media is driven by a simple belief:
                  </p>
                  <p className="text-2xl font-black uppercase tracking-wide text-[#0F172A]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
                    Great ideas deserve great visibility.
                  </p>
                </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 relative rounded-[40px] overflow-hidden align-middle border-8 border-white shadow-2xl h-[600px]">
                <img src="https://res.cloudinary.com/deukqrxtt/image/upload/v1773316552/WhatsApp_Image_2026-03-12_at_5.23.51_PM_mod2cm.jpg" alt="Priyatham - Reecho Media Founder" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-easeInOut"/>
            </motion.div>
          </div>

          {/* We Strongly Follow */}
          <div className="w-[100vw] relative left-1/2 -translate-x-1/2 mt-32 mb-16 flex flex-col items-center overflow-hidden py-12 px-4">
            <motion.h2 
              variants={fadeInUp} 
              className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-16 text-center text-[#0F172A]" 
              style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}
            >
              WE STRONGLY FOLLOW THE WORDS
            </motion.h2>

            <div className="relative w-full flex flex-col items-center justify-center py-10">
               <motion.div variants={fadeInUp} className="w-[110vw] bg-[#FFB703] text-[#0F172A] py-10 md:py-12 rotate-[2deg] flex justify-center items-center z-10 transition-transform hover:scale-105 duration-500 cursor-default shadow-lg">
                   <p className="text-base md:text-xl lg:text-2xl font-medium uppercase tracking-[0.1em] text-center px-4" style={{ fontFamily: '"Inter", sans-serif' }}>
                     GREAT IDEAS ARE BORN FROM TRUE PARTNERSHIPS
                   </p>
               </motion.div>
               <motion.div variants={fadeInUp} className="w-[110vw] bg-[#8ECAE6] text-[#0F172A] py-10 md:py-12 rotate-[-1.5deg] flex justify-center items-center z-20 -mt-2 transition-transform hover:scale-105 duration-500 cursor-default shadow-xl">
                   <p className="text-base md:text-xl lg:text-2xl font-medium uppercase tracking-[0.1em] text-center px-4" style={{ fontFamily: '"Inter", sans-serif' }}>
                     IMAGINATION THRIVES WITHOUT BOUNDARIES
                   </p>
               </motion.div>
               <motion.div variants={fadeInUp} className="w-[110vw] bg-[#F26419] text-white py-10 md:py-12 rotate-[1deg] flex justify-center items-center shadow-2xl z-30 -mt-2 transition-transform hover:scale-105 duration-500 cursor-default">
                   <p className="text-base md:text-xl lg:text-2xl font-medium uppercase tracking-[0.1em] text-center px-4" style={{ fontFamily: '"Inter", sans-serif' }}>
                     WE DON'T JUST CREATE, WE CATALYZE IMPACT
                   </p>
               </motion.div>
            </div>
          </div>

          {/* What We Do */}
          <div className="flex flex-col-reverse lg:flex-row w-full mt-32 gap-16 lg:gap-24 items-center">
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 relative rounded-[40px] overflow-hidden align-middle border-8 border-white shadow-2xl h-auto">
                <img src="https://res.cloudinary.com/deukqrxtt/image/upload/v1773316556/WhatsApp_Image_2026-03-12_at_5.24.46_PM_dhvswh.jpg" alt="Reecho Media Work" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-easeInOut"/>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 flex flex-col justify-center space-y-8">
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
                    What We Do
                </h3>
                <p className="text-xl md:text-2xl text-[#0F172A]/80 font-bold leading-relaxed">
                    At Reecho Media, we help brands move beyond ordinary marketing. We focus on smart strategies, meaningful storytelling, and measurable growth.
                </p>
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#0F172A]/5">
                  <p className="text-lg font-bold uppercase tracking-widest text-[#C4B5FD] mb-6">Our Work Includes:</p>
                  <ul className="space-y-4">
                    {['Strategic Marketing Planning', 'Brand Positioning & Identity', 'Digital Marketing Campaigns', 'Content Strategy', 'Social Media Growth', 'Creative Brand Communication'].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-lg md:text-xl font-medium text-[#0F172A]">
                        <div className="w-2 h-2 rounded-full bg-[#0F172A]"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xl font-bold text-[#0F172A] italic">
                  We don't just promote brands — we help them build a lasting presence.
                </p>
            </motion.div>
          </div>

          {/* Vision, Mission & Why Reecho */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
             <motion.div variants={fadeInUp} className="bg-[#0F172A] text-white p-12 rounded-[40px] shadow-2xl flex flex-col gap-6">
                <h4 className="text-3xl font-black uppercase tracking-widest text-[#C4B5FD]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>Our Vision</h4>
                <p className="text-lg font-medium leading-relaxed opacity-90">To empower businesses, creators, and startups with strategic marketing that amplifies their voice and impact.</p>
             </motion.div>
             <motion.div variants={fadeInUp} className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col gap-6 border border-[#0F172A]/5">
                <h4 className="text-3xl font-black uppercase tracking-widest text-[#0F172A]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>Our Mission</h4>
                <p className="text-lg font-medium leading-relaxed text-[#0F172A]/80">To combine creativity, strategy, and technology to help brands grow faster, connect deeper with their audiences, and stand out in a crowded digital world.</p>
             </motion.div>
             <motion.div variants={fadeInUp} className="bg-[#C4B5FD] p-12 rounded-[40px] shadow-2xl flex flex-col gap-6">
                <h4 className="text-3xl font-black uppercase tracking-widest text-[#0F172A]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>Why Reecho?</h4>
                <p className="text-lg font-medium leading-relaxed text-[#0F172A]/90">
                  The name Reecho represents the power of a message that keeps spreading. When a brand communicates clearly and strategically, its voice doesn't just reach people once — it <span className="font-bold italic">echoes</span>.
                  <br/><br/>
                  And that's exactly what we help create.
                </p>
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
             
             <Link to="/contact" className="flex items-center gap-4 text-xl font-medium text-[#000000] hover:text-[#C4B5FD] transition-colors group mb-12 w-fit">
               Join our journey 
               <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </Link>

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
