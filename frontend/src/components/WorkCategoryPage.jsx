import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

// Dummy data for various categories
const categoryData = {
  'our-photography': {
    title: 'OUR PHOTOGRAPHY',
    images: [
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
    ]
  },
  'our-videography': {
    title: 'OUR VIDEOGRAPHY',
    videos: [
      "https://vjs.zencdn.net/v/oceans.mp4",
      "https://media.w3.org/2010/05/sintel/trailer_720p.mp4",
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      "https://www.w3schools.com/html/mov_bbb.mp4",
    ]
  },
  'ui-ux': {
    title: 'UI / UX DESIGN',
    images: [
      "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541462608141-ad60397d4bc7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
    ]
  },
  '3d-animation': {
    title: '3D ANIMATION & CGI',
    images: [
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    ]
  }
};

const WorkCategoryPage = () => {
  const { category } = useParams();
  
  // Scroll to top on mount (route change)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);
  
  const data = categoryData[category] || { title: 'OUR PORTFOLIO', images: categoryData['our-photography'].images };
  const mediaList = data.videos || data.images;
  const isVideoOrMixed = !!data.videos;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-[#F4F4FA] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#0F172A] selection:text-[#C4B5FD]">
      <Navbar />

      <main className="pt-32 md:pt-48 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center mb-16 md:mb-24 text-center"
        >
          {/* Small Top Badge */}
          <motion.div variants={fadeInUp} className="bg-[#FAF9F6] border border-[#0F172A]/10 px-4 py-1 flex items-center gap-2 mb-6 pointer-events-none rounded shadow-sm">
             <span className="w-1.5 h-1.5 bg-[#C4B5FD] rounded-full"></span>
             <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#0F172A]/70">VISUALS THAT SPEAK</span>
             <span className="w-1.5 h-1.5 bg-[#C4B5FD] rounded-full"></span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp} 
            className="text-[10vw] md:text-[80px] lg:text-[120px] font-black uppercase tracking-tighter leading-[0.9] text-[#0F172A]"
            style={{ fontFamily: '"Bebas Neue", impact, sans-serif' }}
          >
            {data.title}
          </motion.h1>
        </motion.div>

        {/* Masonry / Grid Layout for Images */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {mediaList.map((src, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeInUp}
              className={`w-full overflow-hidden cursor-pointer group rounded-xl md:rounded-[24px] ${idx % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-square"}`}
            >
              {isVideoOrMixed ? (
                  <video 
                    src={src} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-easeInOut" 
                  />
              ) : (
                  <img 
                    src={src} 
                    alt={`${data.title} ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-easeInOut" 
                  />
              )}
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkCategoryPage;
