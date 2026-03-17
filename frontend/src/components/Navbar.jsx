import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--nav-bg)] border-b border-[var(--border)] backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex justify-between items-center text-[var(--text)]">
        <Link to="/" className="flex items-center hover:scale-110 transition-transform">
          <img 
            src="https://res.cloudinary.com/dxcygn064/image/upload/v1773517532/Untitled_design__1_-removebg-preview_h65kii.png" 
            alt="Reecho Media" 
            className="h-16 w-auto object-contain transition-all duration-300 scale-[1.75]"
            style={{ filter: isDark ? 'invert(1)' : 'none' }}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-10 items-center font-medium text-[15px] tracking-wide uppercase">
          <div className="hover:text-[var(--brand)] transition-colors relative group py-6">
            <div className="flex items-center gap-2 cursor-pointer">
              Our Work
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:rotate-180">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className="fixed top-[88px] left-0 w-screen bg-[var(--surface)] text-[var(--text)] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto border-t border-[var(--border)] shadow-xl">
               <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="flex flex-col gap-4">
                   <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--text)] opacity-80">OUR PHOTOGRAPHY</h4>
                   <Link to="/work/our-photography" className="text-xs font-semibold underline underline-offset-4 text-[var(--text)] hover:text-[var(--brand)] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/our-photography" className="mt-2 w-full aspect-[4/3] rounded-2xl overflow-hidden group/image block border border-[var(--border)]">
                     <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" alt="Photography" />
                   </Link>
                 </div>
                 <div className="flex flex-col gap-4">
                   <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--text)] opacity-80">OUR VIDEOGRAPHY</h4>
                   <Link to="/work/our-videography" className="text-xs font-semibold underline underline-offset-4 text-[var(--text)] hover:text-[var(--brand)] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/our-videography" className="mt-2 w-full aspect-[4/3] rounded-2xl overflow-hidden group/image relative block border border-[var(--border)]">
                     <video src="https://vjs.zencdn.net/v/oceans.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" />
                   </Link>
                 </div>
                 <div className="flex flex-col gap-4">
                   <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--text)] opacity-80">UI / UX</h4>
                   <Link to="/work/ui-ux" className="text-xs font-semibold underline underline-offset-4 text-[var(--text)] hover:text-[var(--brand)] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/ui-ux" className="mt-2 w-full aspect-[4/3] rounded-2xl overflow-hidden group/image block border border-[var(--border)]">
                     <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" alt="UI/UX" />
                   </Link>
                 </div>
                 <div className="flex flex-col gap-4">
                   <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--text)] opacity-80">3D ANIMATION</h4>
                   <Link to="/work/3d-animation" className="text-xs font-semibold underline underline-offset-4 text-[var(--text)] hover:text-[var(--brand)] transition-colors uppercase w-fit">EXPLORE</Link>
                   <Link to="/work/3d-animation" className="mt-2 w-full aspect-[4/3] rounded-2xl overflow-hidden group/image block border border-[var(--border)]">
                     <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-in-out" alt="CGI" />
                   </Link>
                 </div>
               </div>
            </div>
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[var(--brand)] transition-all group-hover:w-full"></span>
          </div>

          <Link to="/services" className="hover:text-[var(--brand)] transition-colors relative group py-6">
            Services
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[var(--brand)] transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/campaigns" className="hover:text-[var(--brand)] transition-colors relative group py-6">
            Campaigns
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[var(--brand)] transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/about" className="hover:text-[var(--brand)] transition-colors relative group py-6">
            About
            <span className="absolute bottom-4 left-0 w-0 h-[2px] bg-[var(--brand)] transition-all group-hover:w-full"></span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--text)]/10 transition-colors">
            {isDark ? <Sun size={20} className="text-[var(--accent)]" /> : <Moon size={20} />}
          </button>
          
          <Link to="/contact" className="hidden sm:block px-6 py-2 rounded-full bg-[var(--brand)] text-white font-semibold text-sm uppercase hover:scale-105 transition-all duration-300 shadow-lg">
            Get in Touch
          </Link>

          {/* Hamburger Menu */}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[88px] bg-[var(--surface)] z-40 lg:hidden flex flex-col p-8 gap-6 animate-fadeIn transition-colors border-t border-[var(--border)]">
          <Link to="/work/our-photography" className="text-2xl font-semibold uppercase" onClick={() => setMobileMenuOpen(false)}>Work</Link>
          <Link to="/services" className="text-2xl font-semibold uppercase" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to="/campaigns" className="text-2xl font-semibold uppercase" onClick={() => setMobileMenuOpen(false)}>Campaigns</Link>
          <Link to="/about" className="text-2xl font-semibold uppercase" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className="text-2xl font-semibold uppercase text-[var(--brand)]" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
