import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Dummy data for various categories with filter tags
const categoryData = {
  'our-photography': {
    title: 'OUR PHOTOGRAPHY',
    hookLine: 'CAPTURING FLEETING MOMENTS',
    filterEnabled: true,
    allLabel: 'ALL PHOTOS',
    categories: ['PORTRAITS', 'COMMERCIAL', 'EDITORIAL'],
    items: [
      { src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800", type: "image", tag: "PORTRAITS" },
      { src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800", type: "image", tag: "COMMERCIAL" },
      { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800", type: "image", tag: "EDITORIAL" },
      { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", type: "image", tag: "PORTRAITS" },
      { src: "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&q=80&w=800", type: "image", tag: "COMMERCIAL" },
      { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800", type: "image", tag: "EDITORIAL" },
    ]
  },
  'our-videography': {
    title: 'OUR VIDEOGRAPHY',
    hookLine: 'VISUAL STORIES IN MOTION',
    filterEnabled: true,
    allLabel: 'ALL VIDEOS',
    categories: ['ED-TECH', 'PRODUCTS AND ACCESSORIES', 'FOOD & BEVERAGES'],
    items: [
      { src: "https://vjs.zencdn.net/v/oceans.mp4", type: "video", tag: "ED-TECH" },
      { src: "https://media.w3.org/2010/05/sintel/trailer_720p.mp4", type: "video", tag: "PRODUCTS AND ACCESSORIES" },
      { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", type: "video", tag: "FOOD & BEVERAGES" },
      { src: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video", tag: "ED-TECH" },
    ]
  },
  'ui-ux': {
    title: 'UI / UX DESIGN',
    hookLine: 'INTUITIVE DIGITAL SPACES',
    filterEnabled: false,
    items: [
      { src: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1541462608141-ad60397d4bc7?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800", type: "image" },
    ]
  },
  '3d-animation': {
    title: '3D ANIMATION & CGI',
    hookLine: 'BEYOND REALITY',
    filterEnabled: false,
    items: [
      { src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800", type: "image" },
    ]
  }
};

const WorkCategoryPage = () => {
  const { category } = useParams();
  
  const data = categoryData[category] || categoryData['our-photography'];
  const filterEnabled = data.filterEnabled;
  const categoriesList = filterEnabled ? [data.allLabel, ...data.categories] : [];

  const [activeFilter, setActiveFilter] = useState(filterEnabled ? data.allLabel : '');

  // Scroll to top on mount (route change)
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveFilter(data.filterEnabled ? data.allLabel : '');
  }, [category, data]);
  
  const displayedItems = filterEnabled && activeFilter && activeFilter !== data.allLabel
      ? data.items.filter(item => item.tag === activeFilter)
      : data.items;

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
             <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#0F172A]/70">{data.hookLine || 'VISUALS THAT SPEAK'}</span>
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

        {/* Filters Section */}
        {filterEnabled && categoriesList.length > 0 && (
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-16 px-4">
            {categoriesList.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-8 py-3 rounded-full uppercase text-sm font-bold tracking-[0.2em] transition-all duration-300 border-2 ${activeFilter === cat ? 'bg-[#FBBF24] text-[#0F172A] border-[#FBBF24]' : 'bg-transparent text-[#0F172A] border-[#0F172A]/20 hover:border-[#0F172A]'}`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Masonry / Grid Layout for Items */}
        <motion.div 
          layout
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, idx) => (
              <motion.div 
                key={item.src} 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`w-full overflow-hidden cursor-pointer group rounded-xl md:rounded-[24px] ${idx % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-square"}`}
              >
                {item.type === 'video' ? (
                    <video 
                      src={item.src} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-easeInOut" 
                    />
                ) : (
                    <img 
                      src={item.src} 
                      alt={`${data.title} ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-easeInOut" 
                    />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="flex flex-col items-center bg-[#F4F4FA]"
      >
        <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 bg-[#E8F4EC] rounded-none sm:rounded-[32px] overflow-hidden mb-16 relative mt-16">
          <motion.div variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 w-full">
             <h2 className="text-4xl md:text-[3.5rem] lg:text-[4.5rem] font-black uppercase tracking-tight leading-[0.9] mb-16 text-[#000000]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
               NEED BESPOKE MEDIA FOR YOUR NEXT BIG THING?<br/>
               REACH OUT.
             </h2>

             <div className="w-full h-[1px] bg-[#000000]/20 mb-8 max-w-sm"></div>
             
             <Link to="/contact" className="flex items-center gap-4 text-xl font-medium text-[#000000] hover:text-[#C4B5FD] transition-colors group mb-12 w-fit">
               Let's talk specs 
               <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </Link>

             <p className="text-base md:text-lg font-medium text-[#000000]/70 max-w-md leading-relaxed">
               Whether it's highly technical 3D modeling or capturing the perfect lifestyle shot, we have the gear and the talent. Let's discuss your specific needs.
             </p>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="relative w-full h-full min-h-[400px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200" 
              alt="Media Equipment"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
            />
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default WorkCategoryPage;
