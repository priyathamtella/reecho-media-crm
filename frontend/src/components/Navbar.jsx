import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#F4F4FA]/95 border-b border-[#0F172A]/10 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex justify-between items-center text-[#0F172A]">
        <Link to="/" className="text-4xl font-black tracking-tighter leading-none flex flex-col text-inherit" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>
          <span>REE.</span>
          <span className="-mt-1">CHO</span>
        </Link>

        <div className="hidden lg:flex gap-10 items-center font-bold text-[15px] tracking-wide uppercase">
          {/* Mega Menu Wrapper */}
          <div className="hover:text-[#C4B5FD] transition-colors relative group py-6">
            <div className="flex items-center gap-2 cursor-pointer">
              Our Work
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:rotate-180">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Mega Menu Content (Full Width) */}
            <div className="fixed top-[88px] left-0 w-screen bg-white text-[#0F172A] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto border-t border-[#0F172A]/5">
               <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 grid grid-cols-4 gap-8">
                 {/* Column 1: Photography */}
                 <div className="flex flex-col gap-4">
                   <h4 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">OUR PHOTOGRAPHY</h4>
                   <Link to="/work/our-photography" className="text-xs font-bold underline underline-offset-4 text-[#0F172A] hover:text-[#C4B5FD] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/our-photography" className="mt-2 w-full aspect-[4/3] rounded-xl overflow-hidden group/image block">
                     <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" alt="Photography" />
                   </Link>
                 </div>
                 {/* Column 2: Videography */}
                 <div className="flex flex-col gap-4">
                   <h4 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">OUR VIDEOGRAPHY</h4>
                   <Link to="/work/our-videography" className="text-xs font-bold underline underline-offset-4 text-[#0F172A] hover:text-[#C4B5FD] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/our-videography" className="mt-2 w-full aspect-[4/3] rounded-xl overflow-hidden group/image relative block">
                     <video src="https://vjs.zencdn.net/v/oceans.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" />
                   </Link>
                 </div>
                 {/* Column 3: UI/UX */}
                 <div className="flex flex-col gap-4">
                   <h4 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">UI / UX</h4>
                   <Link to="/work/ui-ux" className="text-xs font-bold underline underline-offset-4 text-[#0F172A] hover:text-[#C4B5FD] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/ui-ux" className="mt-2 w-full aspect-[4/3] rounded-xl overflow-hidden group/image block">
                     <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" alt="UI/UX" />
                   </Link>
                 </div>
                 {/* Column 4: 3D Animation */}
                 <div className="flex flex-col gap-4">
                   <h4 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">3D ANIMATION AND CGI</h4>
                   <Link to="/work/3d-animation" className="text-xs font-bold underline underline-offset-4 text-[#0F172A] hover:text-[#C4B5FD] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/3d-animation" className="mt-2 w-full aspect-[4/3] rounded-xl overflow-hidden group/image block">
                     <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" alt="CGI" />
                   </Link>
                 </div>
               </div>
            </div>
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[#C4B5FD] transition-all group-hover:w-full"></span>
          </div>

          <Link to="/services" className="hover:text-[#C4B5FD] transition-colors relative group py-6">
            Our Services
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[#C4B5FD] transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/campaigns" className="hover:text-[#C4B5FD] transition-colors relative group py-6">
            Campaigns
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[#C4B5FD] transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/about" className="hover:text-[#C4B5FD] transition-colors relative group py-6">
            About Us
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[#C4B5FD] transition-all group-hover:w-full"></span>
          </Link>
        </div>

        <Link to="/contact" className="px-8 py-3 rounded-full border border-[#0F172A]/20 text-[#0F172A] font-bold text-sm uppercase hover:bg-[#0F172A] hover:text-[#F4F4FA] transition-all duration-300 shadow-sm">
          Get in Touch
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
