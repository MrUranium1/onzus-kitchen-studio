import React, { useState, useEffect } from 'react';
import { Send, MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle, ChevronDown, ChevronUp, Loader2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { createInquiry } from '../services/inquiryService';
import { getUserProfile } from '../services/userService';

export default function Contact() {
  const { user } = useAuth();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));

      const loadProfile = async () => {
        setLoadingProfile(true);
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.name || prev.name,
            phone: profile.phoneNumber || prev.phone
          }));
        }
        setLoadingProfile(false);
      };
      loadProfile();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormState('submitting');
    
    try {
      await createInquiry({
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      setFormState('success');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to send message. Please try again or contact us via WhatsApp.');
      setFormState('idle');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const faqs = [
    { q: 'How far in advance should I order a custom cake?', a: 'We recommend ordering custom cakes at least 3–5 days in advance. For elaborate designs or wedding cakes, please give us 1–2 weeks notice. Contact us via WhatsApp for urgent orders.' },
    { q: 'Do you offer delivery across Dhaka?', a: 'Yes! We deliver across Dhaka via trusted partners. charges vary by location. Free delivery is available on orders above ৳1,000 within Kazipara, Mirpur, Dhaka 1216, Bangladesh.' },
    { q: 'Can I get gluten-free or sugar-free options?', a: "We offer selected gluten-free and reduced-sugar options on request. Please mention your requirements when ordering and we'll do our best to accommodate you." },
    { q: 'What payment methods do you accept?', a: 'We accept bKash, Nagad, Rocket, bank transfer, and cash on delivery for local orders. A 50% deposit is required for larger orders.' }
  ];

  return (
    <div className="z-content">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-16 px-4 text-center hero-bg">
        <p className="font-script text-honey text-2xl mb-2">Say Hello</p>
        <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">Get in <em className="text-honey not-italic">Touch</em></h1>
        <p className="font-body text-biscuit/80 max-w-lg mx-auto leading-relaxed">
          Have a custom order, a question, or just want to chat about cake? We'd love to hear from you.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-5 gap-12">
        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <ContactInfoCard icon={<MapPin className="text-caramel" />} title="Location" content="Kazipara, Mirpur, Dhaka 1216, Bangladesh" />
            <ContactInfoCard 
              icon={<MessageCircle className="text-green-500" />} 
              title="WhatsApp Orders" 
              link="https://wa.me/8801719262956"
              content="+880 1719-262956"
              secondary="Fastest way to order!"
            />
            <ContactInfoCard icon={<Phone className="text-rust" />} title="Phone" link="tel:+8801719262956" content="+880 1719-262956" />
            <ContactInfoCard icon={<Mail className="text-caramel" />} title="Email" link="mailto:onzu080@gmail.com" content="onzu080@gmail.com" />
            
            <div className="testi-card rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-caramel/10 rounded-2xl flex items-center justify-center">
                  <Clock className="text-caramel w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-espresso">Order Hours</h3>
                  <p className="text-mocha/70 text-sm font-body">Mon – Fri: 8 AM – 8 PM</p>
                  <p className="text-mocha/70 text-sm font-body">Sat – Sun: 8 AM – 6 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="testi-card rounded-3xl p-6">
            <h3 className="font-display text-lg text-espresso mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/onzuskitchen" target="_blank" rel="noreferrer" className="flex-1 bg-[#1877F2] hover:opacity-90 text-white rounded-2xl py-3 text-center text-xs font-bold font-body transition-all flex items-center justify-center gap-2">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
              <a href="https://www.instagram.com/onzus_kitchen/" target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white rounded-2xl py-3 text-center text-xs font-bold font-body transition-all flex items-center justify-center gap-2">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-3">
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-8 border border-biscuit h-full">
            {!user ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-10 space-y-6">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center shadow-inner">
                  <LogIn className="w-10 h-10 text-caramel opacity-40" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-espresso mb-2">Please login to send an inquiry</h2>
                  <p className="text-mocha/60 font-body text-sm max-w-xs mx-auto">Please sign in to your account to send us an inquiry or ask about an order.</p>
                </div>
                <Link 
                  to="/account" 
                  className="bg-espresso text-cream px-10 py-4 rounded-full font-body font-bold text-sm hover:bg-mocha transition-all active:scale-95 shadow-lg flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Go to Login
                </Link>
                <div className="flex items-center gap-2 text-mocha/40 text-xs">
                  <div className="w-8 border-t border-biscuit"></div>
                  <span>or</span>
                  <div className="w-8 border-t border-biscuit"></div>
                </div>
                <a href="https://wa.me/8801719262956" target="_blank" rel="noreferrer" className="text-green-600 font-bold hover:underline flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us Directly
                </a>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {formState === 'idle' ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h2 className="font-display text-3xl text-espresso">Send a Message</h2>
                       {loadingProfile && <Loader2 className="w-4 h-4 animate-spin text-caramel" />}
                    </div>
                    <p className="text-mocha/60 font-body text-sm mb-7">For custom cakes, bulk orders, or any enquiry — we reply within 2 hours.</p>

                    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Your Name *</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all" 
                          placeholder="e.g. Fatima Rahman" 
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Phone Number (Read-only)</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          readOnly
                          className="w-full bg-cream/10 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none text-mocha/50 cursor-not-allowed" 
                          placeholder="+880 1XXX-XXXXXX" 
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Email Address (Read-only)</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        readOnly
                        className="w-full bg-cream/10 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none text-mocha/50 cursor-not-allowed" 
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Subject *</label>
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="">— Select a subject —</option>
                        <option value="Custom Cake Order">Custom Cake Order</option>
                        <option value="Bulk / Corporate Order">Bulk / Corporate Order</option>
                        <option value="Wedding / Event Order">Wedding / Event Order</option>
                        <option value="General Enquiry">General Enquiry</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Your Message *</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4} 
                        className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all resize-none" 
                        placeholder="Tell us what you'd like to order, any special requirements, delivery address, etc." 
                        required
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={formState === 'submitting'}
                      className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {formState === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Message
                        </>
                      )}
                    </button>
                    
                    <div className="relative py-2">
                       <div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-biscuit"></div></div>
                       <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-mocha/40 font-body italic">or WhatsApp us directly</span></div>
                    </div>

                    <a href="https://wa.me/8801719262956" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95">
                      <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp Us Now
                    </a>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center h-full py-10"
                >
                  <div className="text-7xl mb-6">🎉</div>
                  <h3 className="font-display text-3xl text-espresso mb-3">Message Sent!</h3>
                  <p className="font-body text-mocha/70 text-base mb-8 max-w-xs mx-auto">Thank you! We've received your enquiry and will get back to you within 2 hours during business hours.</p>
                  <button 
                    onClick={() => setFormState('idle')} 
                    className="bg-espresso text-cream px-10 py-4 rounded-full font-body font-bold text-sm hover:bg-mocha transition-all active:scale-95"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <p className="font-script text-caramel text-xl mb-1">Common Questions</p>
          <h2 className="font-display text-4xl text-espresso">FAQ</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/80 rounded-2xl border border-biscuit overflow-hidden transition-all duration-300">
              <button 
                className="w-full text-left px-6 py-5 font-display text-espresso font-semibold flex justify-between items-center group transition-colors hover:bg-biscuit/10"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                {openFaq === i ? <ChevronUp className="text-caramel w-5 h-5" /> : <ChevronDown className="text-caramel w-5 h-5 group-hover:translate-y-0.5 transition-transform" />}
              </button>
              <div className={cn("px-6 pb-5 text-mocha/70 font-body text-sm leading-relaxed", openFaq !== i && "hidden")}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactInfoCard({ icon, title, content, secondary, link }: { icon: React.ReactNode, title: string, content: string, secondary?: string, link?: string }) {
  const Inner = () => (
    <>
      <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 ' + (icon as any).props.className })}
      </div>
      <div>
        <h3 className="font-display text-lg text-espresso">{title}</h3>
        <p className={cn("text-sm font-body font-bold transition-colors", link ? "text-caramel hover:text-rust" : "text-mocha/70")}>{content}</p>
        {secondary && <p className="text-mocha/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">{secondary}</p>}
      </div>
    </>
  );

  return (
    <div className="testi-card rounded-3xl p-6 transition-all hover:translate-x-2">
      {link ? (
        <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-4">
          <Inner />
        </a>
      ) : (
        <div className="flex items-center gap-4">
          <Inner />
        </div>
      )}
    </div>
  );
}
