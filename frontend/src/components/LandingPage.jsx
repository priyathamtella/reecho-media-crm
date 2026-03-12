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
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/166px-Apple_logo_black.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2000px-Netflix_2015_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tesla_Motors.svg/800px-Tesla_Motors.svg.png",
  ];

  const services = [
    { title: "INFLUENCER MARKETING", desc: "Connecting brands with the right voices for impactful campaigns." },
    { title: "CONTENT CREATION", desc: "High-quality, engaging visual stories tailored for your audience." },
    { title: "BRAND STRATEGY", desc: "Data-driven insights to position your brand effectively." },
    { title: "SOCIAL MEDIA", desc: "Building communities and driving engagement across platforms." }
  ];

  // Animation variants
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
    <div className="min-h-screen bg-[#F4F4FA] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#0F172A] selection:text-[#C4B5FD]">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 md:pt-0 px-0 relative flex flex-col items-center bg-[#F4F4FA] overflow-visible">
        
        {/* Rolling Text Area */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="z-10 relative w-full text-center flex flex-col items-center justify-center min-h-[45vh] md:min-h-[60vh] pt-12 md:pt-0"
        >
          <div className="flex justify-center items-center relative w-full h-[30px] md:h-[60px] lg:h-[80px] xl:h-[90px] overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.h1 
                key={currentWordIndex}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute text-[6vw] md:text-[40px] lg:text-[48px] xl:text-[60px] font-black tracking-tighter uppercase leading-none text-[#0F172A]" 
                style={{ fontFamily: '"Bebas Neue", "Dela Gothic One", impact, sans-serif', maxWidth: '100%', whiteSpace: 'nowrap' }}
              >
                {heroWords[currentWordIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <motion.p variants={fadeInUp} className="text-sm md:text-base lg:text-xl font-bold tracking-normal uppercase mt-4 md:mt-8">
            WE LEAD WITH CONTENT. WE SCALE WITH DIGITAL.
          </motion.p>
        </motion.div>

        {/* Clean Slanted Infinite Carousel (Stretched across) */}
        <div className="relative w-full overflow-visible flex flex-col justify-center bg-[#FAF9F6] h-[400px] md:h-[600px] pb-10 md:pb-24 z-20 -mt-6 md:-mt-12">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] rotate-[-5deg] md:rotate-[-8deg] pointer-events-none group">
             {/* The Track. Notice: group-hover:duration-[1000s] forces the animation essentially to pause cleanly alongside Tailwind */}
             <div className="flex w-fit animate-image-marquee hover:[animation-play-state:paused] gap-4 md:gap-8 px-4 pointer-events-auto items-center h-[550px]">
               {[...dummyImages, ...dummyImages, ...dummyImages, ...dummyImages, ...dummyImages].map((src, i) => {
                 return (
                   <div 
                     key={i} 
                     className="shrink-0 w-[240px] h-[320px] md:w-[400px] md:h-[480px] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:z-50 bg-gray-200 relative cursor-pointer group/image"
                   >
                     <img src={src} alt={`Portfolio item ${i}`} className="w-full h-full object-cover" />
                     {/* Overlay tags simulating video */}
                     <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-[#C4B5FD] px-5 py-3 rounded-full inline-block font-bold text-base text-[#0F172A] shadow-lg transform -rotate-2">
                           {i % 2 === 0 ? "Fear not, I'm Gluten-Free!" : "See you soon"}
                        </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>
      </section>

      {/* WE GET THE JOB DONE SECTION (Plain Green + 45-degree Entrance) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-16 md:py-24 px-4 relative flex flex-col items-center justify-center bg-[#0F172A] text-[#C4B5FD] overflow-hidden text-center min-h-[50vh] perspective-1000"
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-[7vw] md:text-[48px] lg:text-[64px] font-black uppercase tracking-tighter leading-[0.9] mb-6" 
          style={{ fontFamily: '"Bebas Neue", "Dela Gothic One", impact, sans-serif' }}
        >
          WE GET THE <br /> JOB DONE
        </motion.h2>
        <motion.p 
          variants={fadeInUp}
          className="max-w-3xl text-sm md:text-lg lg:text-xl font-medium leading-relaxed mb-8 lg:mb-12 opacity-90 mx-auto"
        >
          We're a creative agency team that specializes in providing end-to-end services to help businesses get the required task DONE. With a wide range of expertise, including content creation, brand development, performance marketing, website design and development, graphic design, photography, videography, and 3D animation, we offer a comprehensive suite of services to meet the diverse needs of our clients under one roof.
        </motion.p>

        {/* Scroll-Linked Full Round Rotating Circle element (Unfolds exactly 45 degrees) */}
        <div ref={badgeRef} className="relative w-24 h-24 md:w-32 md:h-32 mx-auto z-10 cursor-pointer group" style={{ perspective: 1000 }}>
          <motion.div 
            style={{ rotate: badgeRotate, rotateX: badgeRotateX, scale: badgeScale, opacity: badgeOpacity }}
            className="w-full h-full bg-[#C4B5FD] rounded-full flex items-center justify-center text-[#0F172A] font-black text-center text-[8px] md:text-[10px] p-2 shadow-2xl relative z-10 outline outline-4 outline-offset-4 outline-[#C4B5FD]/30 uppercase tracking-widest transition-transform duration-500 group-hover:scale-110"
          >
            OUR <br /> BRAND <br /> SOLUTIONS
          </motion.div>
        </div>
      </motion.section>

      {/* Marquee LOGO Section */}
      <section className="py-8 md:py-16 border-y border-[#0F172A]/10 overflow-hidden bg-[#F4F4FA] relative z-20">
        <div className="flex gap-16 md:gap-24 animate-marquee whitespace-nowrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500 items-center">
          {[...dummyLogos, ...dummyLogos, ...dummyLogos, ...dummyLogos].map((src, i) => (
             <img key={i} src={src} className="h-8 md:h-10 lg:h-12 object-contain mx-8" alt="Demo Logo" />
          ))}
        </div>
      </section>

      {/* OUR EXPERTISE / SERVICES SECTION (Hover Accordion) */}
      <motion.section 
        id="services" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-12 md:py-16 px-4 bg-[#F4F4FA] w-full relative z-30"
      >
        <div className="text-center mb-10 relative w-full overflow-hidden">
          <h2 className="text-[10vw] md:text-[72px] lg:text-[108px] font-black uppercase text-[#0F172A] tracking-tight leading-none" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>
            OUR EXPERTISE
          </h2>
        </div>

        <div className="flex flex-col w-full max-w-[1400px] mx-auto px-4 md:px-12 mt-8 gap-4 md:gap-6">
          {[
            { title: "VIDEOGRAPHY", desc: "We create content that connects with your audience - built on strategy, guided by insight, and designed to deliver across platforms." }, 
            { title: "WEBSITE DESIGN & DEVELOPMENT", desc: "We design user experiences that are intuitive, goal-driven, and built around real user behavior - turning complexity into clarity across web and product journeys." }, 
            { title: "CGI AND ANIMATION", desc: "We create sharp, visual content through motion and 3D - built to explain, engage, and stand out across brand and product." }, 
            { title: "PHOTOGRAPHY", desc: "We create content that speaks to your audience and solves for their needs - rooted in strategy, shaped by insight." }
          ].map((service, i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              className="group relative w-full rounded-2xl md:rounded-[32px] bg-[#C4B5FD] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#C4B5FD] transition-colors duration-500 ease-in-out cursor-pointer overflow-hidden leading-tight p-10 md:p-14 border-2 border-transparent"
            >
               <div className="relative z-20 w-full h-full flex flex-col md:flex-row justify-between items-start md:items-center text-inherit gap-8">
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase md:w-[45%] tracking-tight" style={{ fontFamily: '"Bebas Neue", impact, sans-serif' }}>
                    {service.title}
                  </h3>
                  <div className="md:w-[45%]">
                     <p className="text-base md:text-lg lg:text-2xl font-medium leading-relaxed opacity-90 transition-opacity">
                       {service.desc}
                     </p>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Campaigns Block (Box-Style) */}
      <motion.section 
        id="campaigns" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-12 px-4 max-w-[1200px] mx-auto"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <motion.div variants={fadeInUp} className="group relative rounded-[24px] overflow-hidden aspect-square md:w-[50%] cursor-pointer">
            <img src={dummyImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ease-easeInOut" alt="Work 1" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 to-transparent flex flex-col justify-end p-10 text-[#F4F4FA] pointer-events-none">
              <h3 className="text-4xl md:text-5xl font-black uppercase mb-2" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>Aste Cafe</h3>
              <p className="text-base text-[#F4F4FA]/90 bg-[#C4B5FD]/20 backdrop-blur-sm w-fit px-4 py-2 rounded-full uppercase mt-2 font-bold tracking-wider">Branding & Strategy</p>
            </div>
          </motion.div>
          <div className="flex flex-col gap-4 md:w-[50%]">
            <motion.div variants={fadeInUp} className="group relative rounded-[24px] overflow-hidden flex-1 cursor-pointer">
              <img src={dummyImages[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ease-easeInOut" alt="Work 2" />
              <div className="absolute inset-0 bg-[#0F172A]/20 group-hover:bg-[#0F172A]/50 transition-colors duration-500 ease-easeInOut flex items-center justify-center pointer-events-none">
                <div className="bg-[#C4B5FD] p-5 rounded-full text-[#0F172A] backdrop-blur-sm shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500 ease-easeInOut">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            </motion.div>
            <motion.div 
              onClick={() => window.location.href='/contact'}
              variants={fadeInUp} 
              className="group relative rounded-[24px] overflow-hidden h-[180px] md:h-[220px] cursor-pointer bg-white text-[#0F172A] flex flex-col items-center justify-center p-8 hover:bg-[#C4B5FD] hover:text-[#0F172A] transition-colors duration-500 ease-easeInOut border border-[#0F172A]/5 shadow-sm"
            >
               <h3 className="text-3xl md:text-5xl font-black uppercase text-center group-hover:scale-105 transition-transform duration-500 ease-easeInOut" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>Got A<br/>Project?</h3>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Comprehensive Contact block styling updated for split 2-col look */}
      <motion.section 
        id="contact" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="pt-16 min-h-[60vh] flex flex-col items-center bg-[#F4F4FA]"
      >
        <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 bg-[#E4E7E4] rounded-none sm:rounded-[32px] overflow-hidden mb-16 relative">
          
          <motion.div variants={fadeInLeft} className="flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 w-full">
             <h2 className="text-4xl md:text-[3.5rem] lg:text-[4.5rem] font-black uppercase tracking-tight leading-[0.9] mb-16 text-[#202020]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
               READY TO BRING YOUR VISION TO LIFE?<br/>
               CONTACT REECHO TODAY!
             </h2>

             <div className="w-full h-[1px] bg-[#202020]/20 mb-8 max-w-sm"></div>
             
             <Link to="/contact" className="flex items-center gap-4 text-xl font-medium text-[#202020] hover:text-[#C4B5FD] transition-colors group mb-12 w-fit">
               Get in touch 
               <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </Link>

             <p className="text-base md:text-lg font-medium text-[#202020]/70 max-w-md leading-relaxed">
               We'd love to hear from you! Whether you have questions, feedback, or a project idea, feel free to reach out. Our team is committed to responding within 24 hours to assist you promptly.
             </p>
          </motion.div>

          {/* Right side Image block */}
          <motion.div variants={fadeInUp} className="relative w-full h-full min-h-[400px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1200" 
              alt="Person working on laptop"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes imageMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 5)); }
        }
        .animate-image-marquee {
          animation: imageMarquee 40s linear infinite;
        }
        @keyframes fastMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-fast-marquee {
          animation: fastMarquee 15s linear infinite;
        }
      `}} />
    </div>
  );
};

export default LandingPage;
