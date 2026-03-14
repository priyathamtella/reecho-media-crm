import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const AboutUsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-x-hidden selection:bg-[var(--text)] selection:text-[var(--brand)] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <motion.section 
          id="about" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pb-24 w-full relative z-30"
        >
          {/* Header */}
          <div className="text-center mb-24 relative w-full flex flex-col items-center">
            <motion.div variants={fadeInUp} className="bg-[var(--surface)] border border-[var(--border)] px-6 py-2 flex items-center gap-3 mb-8 rounded-full shadow-md">
               <span className="w-2 h-2 bg-[var(--brand)] rounded-full"></span>
               <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[var(--text)] opacity-70">OUR STORY</span>
               <span className="w-2 h-2 bg-[var(--brand)] rounded-full"></span>
            </motion.div>
            <motion.h1 
              variants={fadeInUp} 
              className="text-[10vw] md:text-8xl lg:text-[140px] font-medium uppercase text-[var(--text)] tracking-tighter leading-[0.9] mb-8" 
              style={{ fontFamily: 'serif' }}
            >
              ABOUT US
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-2xl md:text-4xl font-medium uppercase tracking-widest text-[var(--brand)] italic" style={{ fontFamily: 'serif' }}>
              Turning Ideas into Impact
            </motion.p>
          </div>

          {/* The Story */}
          <div className="flex flex-col lg:flex-row w-full mt-12 gap-16 lg:gap-24 items-center">
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 flex flex-col justify-center space-y-10">
                <h3 className="text-3xl md:text-5xl font-medium uppercase tracking-tight leading-tight" style={{ fontFamily: 'serif' }}>
                    Every brand begins with a story.<br/>
                    <span className="text-[var(--brand)]">Reecho Media began with a dream.</span>
                </h3>
                
                <div className="space-y-8 text-lg md:text-xl text-[var(--text)] opacity-90 font-medium leading-relaxed italic">
                  <p>
                    Hi, I'm <span className="text-[var(--brand)] font-semibold">Priyatham</span>. While most students were focused only on completing their degrees, I had a different vision. During the second year of my BSc, I noticed something important — many talented businesses and creators had great ideas but struggled to communicate them to the world.
                  </p>
                  <div className="p-10 bg-[var(--surface)] border-l-4 border-[var(--brand)] rounded-r-3xl shadow-xl my-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)] opacity-5 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform"></div>
                    <p className="text-2xl md:text-3xl font-medium text-[var(--text)] relative z-10 leading-snug">
                      "What if strategy and creativity could help these ideas reach the people who need them most?"
                    </p>
                  </div>
                  <p>
                    And that's how Reecho Media was born.
                  </p>
                  <p>
                    What started as my passion project quickly grew into a platform focused on marketing planning, brand strategy, and digital growth. Built on curiosity, experimentation, and late nights of learning, Reecho Media is driven by a simple belief:
                  </p>
                  <p className="text-3xl md:text-4xl font-medium uppercase tracking-tighter text-[var(--text)] pt-4" style={{ fontFamily: 'serif' }}>
                    Great ideas deserve great visibility.
                  </p>
                </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 relative rounded-[48px] overflow-hidden border border-[var(--border)] shadow-2xl h-[700px]">
                <img src="https://res.cloudinary.com/deukqrxtt/image/upload/v1773316552/WhatsApp_Image_2026-03-12_at_5.23.51_PM_mod2cm.jpg" alt="Priyatham - Reecho Media Founder" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"/>
            </motion.div>
          </div>

          {/* We Strongly Follow */}
          <div className="w-[100vw] relative left-1/2 -translate-x-1/2 mt-40 mb-24 flex flex-col items-center overflow-hidden py-12">
            <motion.h2 
              variants={fadeInUp} 
              className="text-4xl md:text-6xl lg:text-7xl font-medium uppercase tracking-tighter mb-20 text-center text-[var(--text)]" 
              style={{ fontFamily: 'serif' }}
            >
              WE STRONGLY FOLLOW THE WORDS
            </motion.h2>

            <div className="relative w-full flex flex-col items-center justify-center py-10">
               <motion.div variants={fadeInUp} className="w-[110vw] bg-[#FFB703] text-[#0F172A] py-10 md:py-14 rotate-[2deg] flex justify-center items-center z-10 transition-transform hover:scale-105 duration-500 cursor-default shadow-lg">
                   <p className="text-xl md:text-3xl font-semibold uppercase tracking-widest text-center px-8" style={{ fontFamily: 'serif' }}>
                     COLLABORATION IS AT THE HEART OF EVERYTHING WE DO
                   </p>
               </motion.div>
               <motion.div variants={fadeInUp} className="w-[110vw] bg-[#8ECAE6] text-[#0F172A] py-10 md:py-14 rotate-[-1.5deg] flex justify-center items-center z-20 -mt-2 transition-transform hover:scale-105 duration-500 cursor-default shadow-xl">
                   <p className="text-xl md:text-3xl font-semibold uppercase tracking-widest text-center px-8" style={{ fontFamily: 'serif' }}>
                     THERE ARE NO RULES TO CREATIVITY
                   </p>
               </motion.div>
               <motion.div variants={fadeInUp} className="w-[110vw] bg-[#F26419] dark:bg-[#991B32] text-white py-10 md:py-14 rotate-[1deg] flex justify-center items-center shadow-2xl z-30 -mt-4 transition-transform hover:scale-105 duration-500 cursor-default">
                   <p className="text-xl md:text-3xl font-semibold uppercase tracking-widest text-center px-8" style={{ fontFamily: 'serif' }}>
                     OUR WORK DOESN'T JUST EXIST - IT DRIVES CHANGE
                   </p>
               </motion.div>
            </div>
          </div>

          {/* What We Do */}
          <div className="flex flex-col-reverse lg:flex-row w-full mt-48 gap-16 lg:gap-24 items-center">
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 relative rounded-[48px] overflow-hidden border border-[var(--border)] shadow-2xl h-auto">
                <img src="https://res.cloudinary.com/deukqrxtt/image/upload/v1773316556/WhatsApp_Image_2026-03-12_at_5.24.46_PM_dhvswh.jpg" alt="Reecho Media Work" className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"/>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 flex flex-col justify-center space-y-10">
                <h3 className="text-4xl md:text-7xl font-medium uppercase tracking-tighter" style={{ fontFamily: 'serif' }}>
                    What We Do
                </h3>
                <p className="text-xl md:text-2xl text-[var(--text)] opacity-80 font-medium leading-relaxed italic">
                    At Reecho Media, we help brands move beyond ordinary marketing. We focus on smart strategies, meaningful storytelling, and measurable growth.
                </p>
                <div className="bg-[var(--surface)] p-12 rounded-[40px] shadow-2xl border border-[var(--border)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--brand)] mb-8">OUR CORE ARCHITECTURE</p>
                  <ul className="space-y-6">
                    {[
                      'Strategic Marketing Planning', 
                      'Brand Positioning & Identity', 
                      'Digital Marketing Campaigns', 
                      'Content Strategy', 
                      'Social Media Growth', 
                      'Creative Brand Communication'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-6 text-xl md:text-2xl font-medium text-[var(--text)] italic">
                        <span className="w-2 h-2 rounded-full bg-[var(--brand)]"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xl font-semibold text-[var(--brand)] italic">
                  We don't just promote brands — we help them build a lasting presence.
                </p>
            </motion.div>
          </div>

          {/* Vision, Mission & Why Reecho */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-48">
             <motion.div variants={fadeInUp} className="bg-[var(--text)] text-[var(--bg)] p-12 rounded-[48px] shadow-2xl flex flex-col gap-8 border border-[var(--border)]">
                <h4 className="text-3xl font-medium uppercase tracking-widest text-[var(--accent)]" style={{ fontFamily: 'serif' }}>Our Vision</h4>
                <p className="text-xl font-medium leading-relaxed opacity-90 italic">To empower businesses, creators, and startups with strategic marketing that amplifies their voice and impact.</p>
             </motion.div>
             <motion.div variants={fadeInUp} className="bg-[var(--surface)] p-12 rounded-[48px] shadow-2xl flex flex-col gap-8 border border-[var(--border)]">
                <h4 className="text-3xl font-medium uppercase tracking-widest text-[var(--brand)]" style={{ fontFamily: 'serif' }}>Our Mission</h4>
                <p className="text-xl font-medium leading-relaxed text-[var(--text)] opacity-80 italic">To combine creativity, strategy, and technology to help brands grow faster, connect deeper with their audiences, and stand out in a crowded digital world.</p>
             </motion.div>
             <motion.div variants={fadeInUp} className="bg-[var(--brand)] p-12 rounded-[48px] shadow-2xl flex flex-col gap-8 text-white">
                <h4 className="text-3xl font-medium uppercase tracking-widest text-[var(--accent)]" style={{ fontFamily: 'serif' }}>Why Reecho?</h4>
                <p className="text-xl font-medium leading-relaxed opacity-95 italic">
                  The name Reecho represents the power of a message that keeps spreading. When a brand communicates clearly and strategically, its voice doesn't just reach people once — it <span className="font-semibold underline decoration-2 underline-offset-4">echoes</span>.
                  <br/><br/>
                  And that's exactly what we help create.
                </p>
             </motion.div>
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
        <div className="max-w-[1600px] mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-[64px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <motion.div variants={fadeInUp} className="flex flex-col justify-center p-12 md:p-24 z-10 w-full flex-1">
             <h2 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter leading-none mb-12 text-[var(--text)]" style={{ fontFamily: 'serif' }}>
               BELIEVE IN<br/>WHAT WE DO?
             </h2>
             <Link to="/contact" className="flex items-center gap-4 bg-[var(--brand)] text-white px-10 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-transform group shadow-xl w-fit">
               Come Say Hi <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </Link>
             <p className="mt-12 text-lg md:text-xl font-medium text-[var(--text)] opacity-60 max-w-md italic">
               We love connecting with ambitious founders, passionate creators, and innovative brands. Let's start a conversation and see where it leads!
             </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative flex-1 min-h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
              alt="Team at Coworking Space"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
