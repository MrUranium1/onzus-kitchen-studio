import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'success'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('success');
  };

  const faqs = [
    { q: 'How far in advance should I order a custom cake?', a: 'We recommend ordering custom cakes at least 3–5 days in advance. For elaborate designs or wedding cakes, please give us 1–2 weeks notice. Contact us via WhatsApp for urgent orders.' },
    { q: 'Do you offer delivery across Dhaka?', a: 'Yes! We deliver across Dhaka via trusted partners. charges vary by location. Free delivery is available on orders above ৳1,000 within Mohammadpur.' },
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
            <ContactInfoCard icon={<MapPin className="text-caramel" />} title="Location" content="Mohammadpur, Dhaka 1207, Bangladesh" />
            <ContactInfoCard 
              icon={<MessageCircle className="text-green-500" />} 
              title="WhatsApp Orders" 
              link="https://wa.me/8801719262956"
              content="+880 1719-262956"
              secondary="Fastest way to order!"
            />
            <ContactInfoCard icon={<Phone className="text-rust" />} title="Phone" link="tel:+8801719262956" content="+880 1719-262956" />
            <ContactInfoCard icon={<Mail className="text-caramel" />} title="Email" link="mailto:hello@onzuskitchen.com" content="hello@onzuskitchen.com" />
            
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
              <a href="#" className="flex-1 bg-[#1877F2] hover:opacity-90 text-white rounded-2xl py-3 text-center text-xs font-bold font-body transition-all flex items-center justify-center gap-2">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
              <a href="#" className="flex-1 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white rounded-2xl py-3 text-center text-xs font-bold font-body transition-all flex items-center justify-center gap-2">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-3">
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-8 border border-biscuit h-full">
            <AnimatePresence mode="wait">
              {formState === 'idle' ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="font-display text-3xl text-espresso mb-2">Send a Message</h2>
                  <p className="text-mocha/60 font-body text-sm mb-7">For custom cakes, bulk orders, or any enquiry — we reply within 2 hours.</p>

                  <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Your Name *</label>
                        <input type="text" className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all" placeholder="e.g. Fatima Rahman" required/>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Phone Number *</label>
                        <input type="tel" className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all" placeholder="+880 1XXX-XXXXXX" required/>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Email Address</label>
                      <input type="email" className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all" placeholder="your@email.com"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Subject *</label>
                      <select className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all appearance-none cursor-pointer">
                        <option value="">— Select a subject —</option>
                        <option>Custom Cake Order</option>
                        <option>Bulk / Corporate Order</option>
                        <option>Wedding / Event Order</option>
                        <option>General Enquiry</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-mocha uppercase tracking-widest pl-1">Your Message *</label>
                      <textarea rows={4} className="w-full bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3.5 outline-none focus:border-caramel transition-all resize-none" placeholder="Tell us what you'd like to order, any special requirements, delivery address, etc."></textarea>
                    </div>
                    <button type="submit" className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Send Message
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
