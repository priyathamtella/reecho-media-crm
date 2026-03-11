import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Mail, Phone } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', details: '' });
  const [formStatus, setFormStatus] = useState('idle');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch('http://localhost:5050/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', details: '' });
        setTimeout(() => setFormStatus('idle'), 3000);
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      setFormStatus('error');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#F4F4FA] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#0F172A] selection:text-[#C4B5FD] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <motion.section 
          id="contact" 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="pt-24 min-h-[80vh] flex flex-col items-center bg-[#F4F4FA]"
        >
          <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            <motion.div variants={fadeInLeft} className="flex flex-col justify-center">
               <div className="w-20 h-20 bg-[#C4B5FD] text-[#0F172A] flex items-center justify-center rounded-full mb-8 shadow-xl">
                 <ArrowRight size={40} className="rotate-45" />
               </div>
               <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6 text-[#0F172A]" style={{ fontFamily: '"Dela Gothic One", impact, sans-serif' }}>
                 Tell Us <br/>What's Up!
               </h2>
               <p className="text-xl md:text-2xl font-medium text-[#0F172A]/70 mb-12">Need help with a project or just want to chat?</p>
               <div className="space-y-6 text-[#0F172A]/80 font-bold text-lg md:text-xl">
                  <p className="flex items-center gap-4 hover:text-[#C4B5FD] transition-colors cursor-pointer"><MapPin className="text-[#C4B5FD]" size={24} /> 123 Creator Ave, Mumbai</p>
                  <p className="flex items-center gap-4 hover:text-[#C4B5FD] transition-colors cursor-pointer"><Mail className="text-[#C4B5FD]" size={24} /> priyathamtella@gmail.com</p>
                  <p className="flex items-center gap-4 hover:text-[#C4B5FD] transition-colors cursor-pointer"><Phone className="text-[#C4B5FD]" size={24} /> +91 98765 43210</p>
               </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white rounded-[40px] p-8 md:p-14 shadow-2xl border border-[#0F172A]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4B5FD]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]/50">Name *</label>
                     <input 
                       type="text" required
                       value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full p-5 bg-[#F4F4FA] border border-[#0F172A]/10 rounded-[20px] outline-none focus:border-[#C4B5FD] focus:ring-4 focus:ring-[#C4B5FD]/10 transition-all font-bold"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]/50">Email *</label>
                     <input 
                       type="email" required
                       value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                       className="w-full p-5 bg-[#F4F4FA] border border-[#0F172A]/10 rounded-[20px] outline-none focus:border-[#C4B5FD] focus:ring-4 focus:ring-[#C4B5FD]/10 transition-all font-bold"
                     />
                   </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]/50">Services You're Looking For</label>
                  <div className="relative">
                    <select className="w-full p-5 bg-[#F4F4FA] border border-[#0F172A]/10 rounded-[20px] outline-none focus:border-[#C4B5FD] transition-all appearance-none text-[#0F172A]/80 font-bold">
                      <option>Select a service</option>
                      <option>Brand Strategy</option>
                      <option>Photography</option>
                      <option>Website Design</option>
                      <option>3D Animation</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                       <ArrowRight size={20} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]/50">Your message</label>
                  <textarea 
                    required
                    value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                    className="w-full p-5 bg-[#F4F4FA] border border-[#0F172A]/10 rounded-[20px] outline-none focus:border-[#C4B5FD] focus:ring-4 focus:ring-[#C4B5FD]/10 transition-all resize-none h-40 font-bold"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" disabled={formStatus === 'loading'}
                  className="w-full mt-4 py-6 bg-[#0F172A] text-[#F4F4FA] rounded-full font-black uppercase tracking-[0.3em] hover:bg-[#C4B5FD] hover:text-[#0F172A] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 text-sm shadow-xl"
                >
                  {formStatus === 'loading' ? 'Sending...' : 'Start Project'} 
                  {formStatus !== 'loading' && <ArrowRight size={24} />}
                </button>

                {formStatus === 'success' && <p className="text-green-600 font-bold text-center mt-2">Message sent successfully!</p>}
                {formStatus === 'error' && <p className="text-red-500 font-bold text-center mt-2">Failed to send message.</p>}
              </form>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
