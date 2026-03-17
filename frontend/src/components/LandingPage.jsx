import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Play, Instagram, Twitter, Linkedin } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = () => {
  const heroWords = ["CREATIVITY.", "CONTENT.", "STRATEGY."];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const badgeRef = useRef(null);
  const { scrollYProgress: badgeScrollY } = useScroll({
    target: badgeRef,
    offset: ["start bottom", "center center"]
  });

  const badgeRotate = useTransform(badgeScrollY, [0, 1], [0, 45]);
  const badgeRotateX = useTransform(badgeScrollY, [0, 1], [-90, 0]);
  const badgeScale = useTransform(badgeScrollY, [0, 1], [0.5, 1]);
  const badgeOpacity = useTransform(badgeScrollY, [0, 1], [0.3, 1]);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(wordInterval);
  }, []);

  const dummyImages = [
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1621619856624-42fd193a0661?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
  ];

  const dummyLogos = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2000px-Google_2015_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2000px-IBM_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2000px-Amazon_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2000px-Netflix_2015_logo.svg.png",
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeInOut" } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeInOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-x-hidden selection:bg-[var(--text)] selection:text-[var(--brand)] transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 md:pt-0 relative flex flex-col items-center bg-[var(--bg)] overflow-visible">
        <motion.div
          initial="visible"
          animate="visible"
          variants={staggerContainer}
          className="z-10 relative w-full text-center flex flex-col items-center justify-center min-h-[60vh] md:min-h-[75vh] pt-12 md:pt-0"
        >
          <div className="flex justify-center items-center relative w-full min-h-[120px] md:min-h-[160px] overflow-visible">
            <AnimatePresence mode="popLayout">
              <motion.h1
                key={currentWordIndex}
                initial={{ opacity: 0, y: 100, rotateX: 45 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -100, rotateX: -45 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute text-[13vw] md:text-[100px] lg:text-[130px] font-medium tracking-tighter uppercase leading-[0.9] text-[var(--text)]"
                style={{ fontFamily: 'serif' }}
              >
                {heroWords[currentWordIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <motion.p variants={fadeInUp} className="text-sm md:text-lg font-medium tracking-widest uppercase mt-12 text-[var(--text-secondary)]">
            WE LEAD WITH CONTENT. WE SCALE WITH DIGITAL.
          </motion.p>
        </motion.div>

        {/* Slanted Image Carousel */}
        <div className="relative w-full overflow-visible flex flex-col justify-center bg-[var(--bg)] h-full md:h-[650px] pb-10 md:pb-24 z-20 mt-4 md:mt-8 border-y border-[var(--border)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] rotate-[-12deg] pointer-events-none">
            <div className="flex w-fit animate-image-marquee hover:[animation-play-state:paused] gap-4 md:gap-8 px-4 pointer-events-auto items-center h-[600px]">
              {[...dummyImages, ...dummyImages].map((src, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[240px] h-[320px] md:w-[420px] md:h-[520px] rounded-[60px] overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:z-50 bg-[var(--surface)] relative cursor-pointer border border-[var(--border)]"
                >
                  <img src={src} alt={`Portfolio item ${i}`} className="w-full h-full object-cover transition-all duration-500" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-[var(--brand)] px-5 py-3 rounded-full inline-block font-semibold text-base text-white shadow-lg transform -rotate-2">
                      {i % 2 === 0 ? "BEYOND LIMITS" : "SEE YOU SOON"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WE GET THE JOB DONE SECTION */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-32 px-6 relative flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)] overflow-hidden text-center min-h-[60vh]"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-[12vw] md:text-[80px] font-medium uppercase tracking-tight leading-[0.9] mb-10"
          style={{ fontFamily: 'serif' }}
        >
          WE GET THE <br /> JOB DONE
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="max-w-3xl text-lg md:text-2xl font-normal leading-relaxed mb-16 opacity-80 mx-auto italic"
        >
          We're a creative agency team that specializes in providing end-to-end services to help businesses get the required task DONE. We offer a comprehensive suite of services under one roof.
        </motion.p>

        <div ref={badgeRef} className="relative w-40 h-40 mx-auto z-10 cursor-pointer group" style={{ perspective: 1000 }}>
          <motion.div
            style={{ rotate: badgeRotate, rotateX: badgeRotateX, scale: badgeScale, opacity: badgeOpacity }}
            className="w-full h-full bg-[#EAB308] rounded-full flex items-center justify-center text-[#0F172A] font-semibold text-center text-xs p-5 shadow-2xl uppercase tracking-widest transition-transform duration-500 group-hover:scale-110 border-4 border-white/20"
          >
            OUR BRANDS <br /> & SOLUTIONS
          </motion.div>
        </div>
      </motion.section>

      {/* Marquee LOGO Section */}
      <section className="py-16 border-y border-[var(--border)] overflow-hidden bg-[var(--bg)] relative z-20">
        <div className="flex gap-20 animate-marquee whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity duration-500 items-center">
          {[...dummyLogos, ...dummyLogos].map((src, i) => (
            <img key={i} src={src} className="h-8 md:h-12 object-contain mx-8" alt="Partner Logo" />
          ))}
        </div>
      </section>

      {/* OUR EXPERTISE SECTION */}
      <motion.section
        id="services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-32 px-6 bg-[var(--bg)] w-full relative z-30"
      >
        <div className="text-center mb-24">
          <h2 className="text-[12vw] md:text-[110px] font-medium uppercase text-[var(--text)] tracking-tighter leading-none" style={{ fontFamily: 'serif' }}>
            OUR EXPERTISE
          </h2>
        </div>

        <div className="flex flex-col w-full max-w-7xl mx-auto gap-8">
          {[
            { title: "VIDEOGRAPHY", desc: "We create content that connects with your audience - built on strategy, guided by insight, and designed to deliver across platforms." },
            { title: "WEBSITE DESIGN & DEVELOPMENT", desc: "We design user experiences that are intuitive, goal-driven, and built around real user behavior - turning complexity into clarity." },
            { title: "CGI AND ANIMATION", desc: "We create sharp, visual content through motion and 3D - built to explain, engage, and stand out across brand and product." },
            { title: "PHOTOGRAPHY", desc: "We create content that speaks to your audience and solves for their needs - rooted in strategy, shaped by insight." }
          ].map((service, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="group relative w-full rounded-[48px] bg-[var(--surface)] border border-[var(--border)] hover:bg-[#991B1B] hover:text-white transition-all duration-700 p-10 md:p-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 cursor-pointer shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(153,27,27,0.3)]"
            >
              <h3 className="text-4xl md:text-7xl font-medium uppercase md:w-1/2 tracking-tighter leading-none" style={{ fontFamily: 'serif' }}>
                {service.title}
              </h3>
              <p className="text-xl md:text-2xl font-normal md:w-1/2 opacity-70 italic leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Campaigns Block */}
      <motion.section
        id="campaigns"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-20 px-6 max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row gap-10">
          <motion.div variants={fadeInUp} className="group relative rounded-[48px] overflow-hidden aspect-square md:w-1/2 shadow-2xl border border-[var(--border)]">
            <img src={dummyImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Featured Work" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 to-transparent flex flex-col justify-end p-12 text-white">
              <h3 className="text-5xl font-medium uppercase mb-6 tracking-tight" style={{ fontFamily: 'serif' }}>ASTE CAFE</h3>
              <p className="text-sm font-semibold tracking-widest uppercase bg-[#991B1B] w-fit px-8 py-3 rounded-full shadow-lg">Branding & Strategy</p>
            </div>
          </motion.div>
          <div className="flex flex-col gap-10 md:w-1/2">
            <motion.div variants={fadeInUp} className="group relative rounded-[48px] overflow-hidden flex-1 shadow-2xl border border-[var(--border)] min-h-[300px]">
              <img src={dummyImages[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Campaign" />
              <div className="absolute inset-0 bg-[#0F172A]/10 group-hover:bg-[#0F172A]/40 flex items-center justify-center transition-all duration-500">
                <div className="bg-[#EAB308] p-8 rounded-full text-[#0F172A] shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                  <Play size={40} fill="currentColor" />
                </div>
              </div>
            </motion.div>
            <motion.div
              onClick={() => window.location.href = '/contact'}
              variants={fadeInUp}
              className="group relative rounded-[48px] overflow-hidden h-48 md:h-64 bg-[#991B1B] text-white flex flex-col items-center justify-center p-10 hover:scale-[1.02] transition-all duration-500 cursor-pointer shadow-2xl overflow-hidden"
            >
              <h3 className="text-5xl md:text-7xl font-medium uppercase text-center tracking-tighter mb-2" style={{ fontFamily: 'serif' }}>Got A PROJECT?</h3>
              <div className="flex items-center gap-2 text-white/60 font-medium tracking-widest text-xs">
                <span className="w-8 h-[1px] bg-white/30"></span>
                LET'S BUILD SOMETHING GREAT
                <span className="w-8 h-[1px] bg-white/30"></span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CONTACT BANNER */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-[64px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <motion.div variants={fadeInLeft} className="p-16 md:p-28 flex-1 flex flex-col justify-center">
            <h2 className="text-5xl md:text-8xl font-medium uppercase tracking-tighter leading-[0.85] mb-16 text-[var(--text)]" style={{ fontFamily: 'serif' }}>
              READY TO BRING YOUR VISION TO LIFE?
            </h2>
            <Link to="/contact" className="flex items-center gap-4 bg-[#991B1B] text-white w-fit px-12 py-6 rounded-full text-2xl font-semibold hover:scale-105 transition-transform group shadow-2xl">
              Let's Talk <ArrowRight className="group-hover:translate-x-3 transition-transform" />
            </Link>
          </motion.div>
          <div className="flex-1 min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1200"
              alt="Creative Consultation"
              className="w-full h-full object-cover opacity-90 transition-all duration-1000 hover:scale-105"
            />
          </div>
        </div>
      </section>

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes imageMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-image-marquee { animation: imageMarquee 60s linear infinite; }
      `}} />
    </div>
  );
};

export default LandingPage;