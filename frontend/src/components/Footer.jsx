import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-[#F4F4FA] relative flex flex-col pt-24 mt-20 overflow-hidden w-full">
      <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16 z-20">
         
         <div className="md:col-span-6 flex flex-col justify-start">
           <p className="text-lg font-medium leading-relaxed max-w-sm mb-12 text-[#F4F4FA]/90">
             A creative agency specializing in branding, web development, motion graphics, and art direction to bring ideas to life.
           </p>
           <a href="https://www.instagram.com/reecho_media/" target="_blank" rel="noopener noreferrer" className="border border-[#F4F4FA]/50 rounded-full p-3 w-fit hover:bg-[#C4B5FD] hover:text-[#0F172A] hover:border-[#C4B5FD] transition-colors">
             <Instagram size={24} />
           </a>
         </div>

         <div className="md:col-span-3 flex flex-col gap-4 text-base font-bold uppercase tracking-wider">
           <h4 className="text-[#C4B5FD] mb-4">Quick Links</h4>
           <Link to="/" className="hover:text-[#C4B5FD] transition-colors">Home</Link>
           <Link to="/about" className="hover:text-[#C4B5FD] transition-colors">About</Link>
           <Link to="/contact" className="hover:text-[#C4B5FD] transition-colors">Contact</Link>
           <Link to="/services" className="hover:text-[#C4B5FD] transition-colors">Our Services</Link>
           <Link to="/contact" className="hover:text-[#C4B5FD] transition-colors">Join Us</Link>
         </div>

         <div className="md:col-span-3 flex flex-col gap-4 text-base font-bold uppercase tracking-wider">
           <h4 className="text-[#C4B5FD] mb-4">Explore</h4>
           <Link to="/work/our-photography" className="hover:text-[#C4B5FD] transition-colors">Our Photography</Link>
           <Link to="/work/our-videography" className="hover:text-[#C4B5FD] transition-colors">Our Videography</Link>
           <Link to="/work/ui-ux" className="hover:text-[#C4B5FD] transition-colors">Website Development</Link>
           <Link to="/work/3d-animation" className="hover:text-[#C4B5FD] transition-colors">3D Animation and CGI</Link>
         </div>

      </div>

      {/* HUGE WE ARE Text in footer */}
      <div className="w-[110%] -ml-[5%] relative mt-16 mb-8 overflow-hidden z-20 mx-auto text-center text-[#C4B5FD] select-none pointer-events-none">
         <h1 className="text-[15vw] sm:text-[18vw] font-black uppercase leading-[0.75] tracking-tighter" style={{ fontFamily: '"Bebas Neue", impact, sans-serif' }}>
            REECHO
         </h1>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-[#0B1120] text-[#F4F4FA] py-8 z-30 relative px-6 w-full mt-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/60">
          <p>Copyright 2026 REECHO</p>
          <div className="flex gap-8 items-center">
            <Link to="/login" className="hover:text-white transition-colors uppercase font-bold tracking-widest bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-sm">Login Portal</Link>
            <a href="#" className="hover:text-white transition-colors border-r border-white/20 pr-8">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
