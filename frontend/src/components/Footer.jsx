import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const Footer = () => {
  return (
    <footer className="bg-[var(--text)] text-[var(--bg)] relative flex flex-col pt-24 mt-20 overflow-hidden w-full transition-colors duration-300">
      <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16 z-20">
         
         <div className="md:col-span-6 flex flex-col justify-start">
            <div className="flex items-center gap-6 mb-8">
               <Link to="/" className="hover:scale-110 transition-transform">
                   <img 
                     src="https://res.cloudinary.com/dxcygn064/image/upload/v1773517532/Untitled_design__1_-removebg-preview_h65kii.png" 
                     alt="Reecho Media" 
                     className="h-14 w-auto object-contain invert dark:invert-0 transition-all duration-300 scale-150"
                   />
               </Link>
               <a href="https://www.instagram.com/reecho_media/" target="_blank" rel="noopener noreferrer" className="border border-[var(--bg)]/30 rounded-full p-4 w-fit hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] transition-all duration-300 shadow-lg">
                 <Instagram size={24} />
               </a>
            </div>
           <p className="text-lg font-medium leading-relaxed max-w-sm mb-12 opacity-80 italic">
             A creative agency specializing in branding, web development, motion graphics, and art direction to bring ideas to life.
           </p>
         </div>

         <div className="md:col-span-3 flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider">
           <h4 className="text-[var(--brand)] mb-4 text-xs tracking-[0.3em]">QUICK LINKS</h4>
           <Link to="/" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">Home</Link>
           <Link to="/about" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">About Us</Link>
           <Link to="/contact" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">Contact</Link>
           <Link to="/services" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">Our Services</Link>
           <Link to="/campaigns" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">Campaigns</Link>
         </div>

         <div className="md:col-span-3 flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider">
           <h4 className="text-[var(--brand)] mb-4 text-xs tracking-[0.3em]">EXPLORE WORK</h4>
           <Link to="/work/our-photography" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">Photography</Link>
           <Link to="/work/our-videography" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">Videography</Link>
           <Link to="/work/ui-ux" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">UI / UX Design</Link>
           <Link to="/work/3d-animation" onClick={scrollToTop} className="hover:text-[var(--brand)] transition-colors">3D Animation</Link>
         </div>

      </div>

      <div className="mt-16"></div>

      {/* Bottom Legal Bar */}
      <div className="bg-[var(--text)] border-t border-[var(--bg)]/10 py-8 z-30 relative px-6 w-full">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium opacity-60">
          <p>© 2026 ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 items-center">
            <Link to="/login" className="hover:text-[var(--brand)] transition-colors uppercase font-semibold tracking-widest bg-[var(--bg)]/5 px-6 py-2 rounded-lg border border-[var(--bg)]/10">Admin Login</Link>
            <a href="#" className="hover:text-[var(--brand)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--brand)] transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
