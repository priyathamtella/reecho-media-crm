import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Mail, Phone } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    servicesLookingFor: '',
    companyName: '',
    companyWebsite: '',
    details: ''
  });
  const [formStatus, setFormStatus] = useState('idle');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    
    // Construct WhatsApp Message
    const text = `🚀 *New Lead Alert! Let's Make Some Magic!* 🚀\n\nHey Team Reecho! We just got a brand new project inquiry from *${formData.name}*.\n\n✨ *The Visionary:* ${formData.name}\n📧 *Email:* ${formData.email}\n📱 *Contact:* ${formData.contactNo}\n💼 *Company:* ${formData.companyName || 'N/A'} (🌐 ${formData.companyWebsite || 'N/A'})\n\n🎯 *What They Need:* ${formData.servicesLookingFor}\n\n💬 *Their Message/Idea:*\n"${formData.details}"\n\nLet's get in touch and build something incredible! 🔥`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/919121492646?text=${encodedText}`;

    try {
      const res = await fetch('http://localhost:5050/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        setFormStatus('success');
        setFormData({ name: '', email: '', contactNo: '', servicesLookingFor: '', companyName: '', companyWebsite: '', details: '' });
        setTimeout(() => setFormStatus('idle'), 3000);
      } else {
        // Even if email fails, let's at least open WhatsApp so you don't lose the lead
        window.open(whatsappUrl, '_blank');
        
        setFormStatus('error');
      }
    } catch (err) {
      // Even if email fails, let's at least open WhatsApp so you don't lose the lead
      window.open(whatsappUrl, '_blank');
      setFormStatus('error');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#0F172A] selection:text-[#C4B5FD] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col justify-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase text-[#2B2B2B] tracking-tight mb-8" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>
            GET IN TOUCH
          </h1>

          <form onSubmit={handleContactSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>YOUR NAME</label>
                 <input 
                   type="text" required placeholder="Name"
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>EMAIL ADDRESS</label>
                 <input 
                   type="email" required placeholder="Email"
                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium"
                 />
               </div>
               
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>CONTACT NO.</label>
                 <input 
                   type="tel" required placeholder="Contact No."
                   value={formData.contactNo} onChange={e => setFormData({...formData, contactNo: e.target.value})}
                   className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>SERVICES YOU'RE LOOKING FOR?</label>
                 <select 
                   required
                   value={formData.servicesLookingFor} onChange={e => setFormData({...formData, servicesLookingFor: e.target.value})}
                   className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium appearance-none"
                 >
                   <option value="" disabled>Select</option>
                   <option>Brand Activations</option>
                   <option>360° Digital Marketing</option>
                   <option>Content Creation</option>
                   <option>3D Animation and CGI</option>
                   <option>Performance Marketing</option>
                   <option>Website Design and Development</option>
                   <option>Consulting</option>
                   <option>Designing and Branding</option>
                   <option>Social Media</option>
                   <option>Hero Campaigns</option>
                   <option>Personal Branding</option>
                 </select>
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>COMPANY NAME</label>
                 <input 
                   type="text" placeholder="Company Name"
                   value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                   className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>COMPANY WEBSITE (OPTIONAL)</label>
                 <input 
                   type="text" placeholder="www.xyz.com"
                   value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})}
                   className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium"
                 />
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-sm font-black uppercase tracking-wide text-[#2B2B2B]" style={{ fontFamily: '"Impact", "Bebas Neue", sans-serif' }}>YOUR MESSAGE</label>
               <textarea 
                 required placeholder="Message"
                 value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                 className="w-full p-4 bg-white border border-[#2B2B2B]/20 rounded-md outline-none focus:border-[#C4B5FD] transition-colors text-sm text-[#2B2B2B]/80 font-medium h-48 resize-y"
               ></textarea>
            </div>
            
            <button 
              type="submit" disabled={formStatus === 'loading'}
              className="mt-2 py-4 px-8 bg-[#2B2B2B] text-white rounded-md font-black uppercase tracking-widest hover:bg-[#C4B5FD] hover:text-[#2B2B2B] transition-colors duration-300 disabled:opacity-50 text-sm w-fit"
            >
              {formStatus === 'loading' ? 'SENDING...' : 'SUBMIT'}
            </button>

            {formStatus === 'success' && <p className="text-green-600 font-bold mt-2">Message sent successfully!</p>}
            {formStatus === 'error' && <p className="text-red-500 font-bold mt-2">Failed to send message.</p>}
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
