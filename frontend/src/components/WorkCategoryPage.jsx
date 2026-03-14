import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Dummy data for various categories with filter tags
const categoryData = {
  'our-photography': {
    title: 'PHOTOGRAPHY',
    hookLine: 'CAPTURING THE ESSENCE',
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
    title: 'VIDEOGRAPHY',
    hookLine: 'STORIES IN MOTION',
    filterEnabled: true,
    allLabel: 'ALL VIDEOS',
    categories: ['ED-TECH', 'PRODUCTS', 'FOOD'],
    items: [
      { src: "https://vjs.zencdn.net/v/oceans.mp4", type: "video", tag: "ED-TECH" },
      { src: "https://media.w3.org/2010/05/sintel/trailer_720p.mp4", type: "video", tag: "PRODUCTS" },
      { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", type: "video", tag: "FOOD" },
      { src: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video", tag: "ED-TECH" },
    ]
  },
  'ui-ux': {
    title: 'UI / UX DESIGN',
    hookLine: 'DIGITAL ARCHITECTURE',
    filterEnabled: false,
    items: [
      { src: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1541462608141-ad60397d4bc7?auto=format&fit=crop&q=80&w=800", type: "image" },
      { src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800", type: "image" },
    ]
  },
  '3d-animation': {
    title: '3D & CGI',
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

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveFilter(data.filterEnabled ? data.allLabel : '');
  }, [category, data]);
  
  const displayedItems = filterEnabled && activeFilter && activeFilter !== data.allLabel
      ? data.items.filter(item => item.tag === activeFilter)
      : data.items;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-x-hidden selection:bg-[var(--text)] selection:text-[var(--brand)] transition-colors duration-300">
      <Navbar />

      <main className="pt-32 md:pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="flex flex-col items-center mb-16 md:mb-24 text-center"
        >
          <motion.div variants={fadeInUp} className="mb-6 flex items-center gap-3">
             <span className="w-1.5 h-1.5 bg-[var(--brand)] rounded-full"></span>
             <span className="text-xs font-semibold tracking-[0.3em] uppercase opacity-70">{data.hookLine}</span>
             <span className="w-1.5 h-1.5 bg-[var(--brand)] rounded-full"></span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp} 
            className="text-6xl md:text-8xl lg:text-[120px] font-medium uppercase tracking-tighter leading-none"
            style={{ fontFamily: 'serif' }}
          >
            {data.title}
          </motion.h1>
        </motion.div>

        {filterEnabled && (
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-16">
            {categoriesList.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-8 py-3 rounded-full uppercase text-xs font-semibold tracking-[0.2em] transition-all duration-300 border-2 ${activeFilter === cat ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-lg' : 'bg-transparent text-[var(--text)] border-[var(--border)] hover:border-[var(--brand)]'}`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        <motion.div 
          layout
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, idx) => (
              <motion.div 
                key={item.src} 
                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`w-full overflow-hidden cursor-pointer group rounded-[40px] border border-[var(--border)] shadow-xl ${idx % 3 === 0 ? "md:col-span-2 aspect-video" : "aspect-square"}`}
              >
                {item.type === 'video' ? (
                    <video src={item.src} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <img src={item.src} alt={data.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* CTA SECTION */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="px-6 pb-24">
        <div className="max-w-7xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <motion.div variants={fadeInUp} className="p-12 md:p-24 flex-1 flex flex-col justify-center">
             <h2 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter leading-none mb-12" style={{ fontFamily: 'serif' }}>
               NEED BESPOKE<br/>MEDIA?
             </h2>
             <Link to="/contact" className="flex items-center gap-4 bg-[var(--brand)] text-white px-10 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-transform group shadow-xl w-fit">
               Let's Talk Specs <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </Link>
          </motion.div>
          <div className="flex-1 min-h-[400px]">
            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200" alt="Equipment" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default WorkCategoryPage;
