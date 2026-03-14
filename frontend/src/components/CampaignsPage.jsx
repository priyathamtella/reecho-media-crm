import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, Rocket, Star } from 'lucide-react';

const CampaignsPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const phases = [
    {
      number: "01",
      title: "The Mastermind",
      subtitle: "Strategy & Identity",
      content: "We never build a house without a blueprint. Through high-level Consulting and deep-dive Designing and Branding, we define exactly who you are and who needs to hear about it.",
      icon: <Target className="w-8 h-8" />,
    },
    {
      number: "02",
      title: "Building the Universe",
      subtitle: "Creative & Tech",
      content: "Next, we build the world your audience will step into. We design high-converting foundations through Website Design and Development, filled with 3D Animation and CGI.",
      icon: <Zap className="w-8 h-8" />,
    },
    {
      number: "03",
      title: "Turning Up the Volume",
      subtitle: "Amplification",
      content: "We deploy 360° Digital Marketing to surround your audience. Our Social Media wizards build community, while Performance Marketing optimizes every penny for ROI.",
      icon: <Rocket className="w-8 h-8" />,
    },
    {
      number: "04",
      title: "The Showstoppers",
      subtitle: "The Big Splash",
      content: "When it's time to make history, we pull out the heavy artillery. We orchestrate massive Hero Campaigns and launch real-world Brand Activations.",
      icon: <Star className="w-8 h-8" />,
    }
  ];

  const placeholders = [
    {
      title: "Future of Branding",
      src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
      tag: "DIGITAL DOMINANCE"
    },
    {
      title: "Data Reimagined",
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
      tag: "STRATEGIC ROI"
    },
    {
      title: "Real-World Impact",
      src: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
      tag: "BRAND ACTIVATION"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-x-hidden selection:bg-[var(--text)] selection:text-[var(--brand)] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="px-6 max-w-7xl mx-auto text-center mb-24">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="text-[12vw] md:text-[80px] lg:text-[100px] font-medium uppercase text-[var(--text)] tracking-tighter leading-[0.9] mb-8" style={{ fontFamily: 'serif' }}>
              COMMAND ATTENTION
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-[var(--brand)] max-w-4xl mx-auto mb-12">
              Most agencies just run ads. We orchestrate digital blockbusters.
            </p>
            <p className="text-lg md:text-2xl font-medium text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed italic">
              At Reecho Media, a campaign isn't just a few social posts. It is a living, breathing ecosystem designed to make your audience stop, stare, and take action.
            </p>
          </motion.div>
        </section>

        {/* PHASES GRID */}
        <section className="px-6 max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {phases.map((phase, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-[var(--surface)] p-8 rounded-[40px] shadow-lg flex flex-col gap-6 border border-[var(--border)] hover:border-[var(--brand)] transition-all duration-300 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-4xl font-semibold opacity-20" style={{ fontFamily: 'serif' }}>{phase.number}</span>
                  <div className="bg-[var(--brand)] p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                    {phase.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold uppercase tracking-tight mb-2" style={{ fontFamily: 'serif' }}>
                    {phase.title}
                  </h2>
                  <p className="text-sm font-semibold text-[var(--brand)] uppercase tracking-widest mb-4">{phase.subtitle}</p>
                  <p className="text-base leading-relaxed font-medium opacity-80 italic">
                    {phase.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURED CAMPAIGNS */}
        <section className="bg-[var(--text)] py-24 mb-20 text-[var(--bg)]">
          <div className="px-6 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-medium uppercase text-center mb-16 tracking-tighter" style={{ fontFamily: 'serif' }}>
              THE BLOCKBUSTER EXPERIENCE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {placeholders.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative rounded-[40px] overflow-hidden aspect-[4/5] cursor-pointer shadow-2xl border border-[var(--bg)]/10"
                >
                  <img src={item.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--text)] to-transparent flex flex-col justify-end p-8 text-white">
                    <span className="text-xs font-semibold tracking-widest text-[var(--accent)] mb-2 uppercase">{item.tag}</span>
                    <h3 className="text-3xl font-medium uppercase" style={{ fontFamily: 'serif' }}>{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="bg-[var(--surface)] rounded-[48px] overflow-hidden flex flex-col lg:flex-row border border-[var(--border)] shadow-2xl">
            <div className="p-12 md:p-20 flex-1 flex flex-col justify-center">
              <h2 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter leading-tight mb-8 text-[var(--text)]" style={{ fontFamily: 'serif' }}>
                READY TO BREAK<br />THE INTERNET?
              </h2>
              <Link to="/contact" className="inline-flex items-center gap-4 bg-[var(--brand)] text-white px-10 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-transform group shadow-xl w-fit">
                Let's Make History
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div className="flex-1 min-h-[400px]">
               <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
                alt="Campaign Concept"
                className="w-full h-full object-cover grayscale opacity-80"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignsPage;
