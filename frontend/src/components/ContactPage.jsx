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
    const text = `🚀 *New Lead Alert!* 🚀\n\nHey Team Reecho! We just got a brand new project inquiry from *${formData.name}*.\n\n✨ *The Visionary:* ${formData.name}\n📧 *Email:* ${formData.email}\n📱 *Contact:* ${formData.contactNo}\n💼 *Company:* ${formData.companyName || 'N/A'} (🌐 ${formData.companyWebsite || 'N/A'})\n\n🎯 *What They Need:* ${formData.servicesLookingFor}\n\n💬 *Their Message/Idea:*\n"${formData.details}"\n\nLet's build something incredible! 🔥`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/919121492646?text=${encodedText}`;

    try {
      const res = await fetch('https://reechomedia.com/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        window.open(whatsappUrl, '_blank');
        setFormStatus('success');
        setFormData({ name: '', email: '', contactNo: '', servicesLookingFor: '', companyName: '', companyWebsite: '', details: '' });
        setTimeout(() => setFormStatus('idle'), 3000);
      } else {
        window.open(whatsappUrl, '_blank');
        setFormStatus('error');
      }
    } catch (err) {
      window.open(whatsappUrl, '_blank');
      setFormStatus('error');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col justify-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-12">
          <h1 className="text-5xl md:text-8xl font-medium uppercase tracking-tighter mb-12" style={{ fontFamily: 'serif' }}>
            GET IN TOUCH
          </h1>

          <form onSubmit={handleContactSubmit} className="flex flex-col gap-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">YOUR NAME</label>
                 <input 
                   type="text" required placeholder="Name"
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium italic"
                 />
               </div>
               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">EMAIL ADDRESS</label>
                 <input 
                   type="email" required placeholder="Email"
                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium italic"
                 />
               </div>
               
               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">CONTACT NO.</label>
                 <input 
                   type="tel" required placeholder="Contact No."
                   value={formData.contactNo} onChange={e => setFormData({...formData, contactNo: e.target.value})}
                   className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium italic"
                 />
               </div>
               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">SERVICES</label>
                 <div className="relative">
                  <select 
                    required
                    value={formData.servicesLookingFor} onChange={e => setFormData({...formData, servicesLookingFor: e.target.value})}
                    className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium appearance-none italic"
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
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ArrowRight className="rotate-90 w-4 h-4" />
                  </div>
                 </div>
               </div>

               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">COMPANY NAME</label>
                 <input 
                   type="text" placeholder="Company Name"
                   value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                   className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium italic"
                 />
               </div>
               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">COMPANY WEBSITE</label>
                 <input 
                   type="text" placeholder="www.xyz.com"
                   value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})}
                   className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium italic"
                 />
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <label className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">YOUR MESSAGE</label>
               <textarea 
                 required placeholder="Tell us about your project..."
                 value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                 className="w-full p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--brand)] transition-colors text-base font-medium h-48 resize-y italic"
               ></textarea>
            </div>
            
            <button 
              type="submit" disabled={formStatus === 'loading'}
              className="mt-4 py-5 px-12 bg-[var(--brand)] text-white rounded-full font-semibold uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50 text-base w-fit flex items-center gap-3"
            >
              {formStatus === 'loading' ? 'SENDING...' : 'SUBMIT PROJECT'}
              <ArrowRight size={20} />
            </button>

            {formStatus === 'success' && <p className="text-green-600 font-semibold mt-2">Message sent successfully!</p>}
            {formStatus === 'error' && <p className="text-red-500 font-semibold mt-2">Failed to send message.</p>}
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
