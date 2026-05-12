import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Users2, ShieldCheck, Leaf, Star, Gift, ChevronRight, Sparkles } from 'lucide-react';

export default function About() {
  const values = [
    { icon: <Leaf className="w-8 h-8 text-caramel" />, title: 'Premium Ingredients', desc: 'We source the finest flour, real butter, farm eggs, and natural flavourings. No shortcuts, no preservatives — just pure, honest baking.' },
    { icon: <Heart className="w-8 h-8 text-caramel" />, title: 'Made with Heart', desc: 'Every item is baked fresh on the day of your order. We bake in small batches so nothing sits on a shelf — only the warmest, freshest goods reach you.' },
    { icon: <Users2 className="w-8 h-8 text-caramel" />, title: 'Community First', desc: "We believe food brings people together. That's why we donate surplus bakes to local shelters every Friday, giving back to our community." },
    { icon: <SparklesIcon />, title: 'Eco-Conscious', desc: 'Our packaging is fully recyclable. We minimise food waste by baking to order and composting all organic scraps from our kitchen.' },
    { icon: <Star className="w-8 h-8 text-caramel" />, title: 'Consistent Quality', desc: 'Same recipe, same care — every single time. We follow strict quality checks so that every order tastes wonderful.' },
    { icon: <Gift className="w-8 h-8 text-caramel" />, title: 'Personal Touch', desc: 'Custom orders, personalised messages, special dietary accommodations — we go the extra mile to make every occasion special.' }
  ];

  const timeline = [
    { year: '2019', title: 'The First Batch', desc: "Onzu bakes her mother's oatmeal cookies for a neighbour's celebration. Word spreads, and ten families place orders the next week." },
    { year: '2020', title: 'Going Online', desc: "During the pandemic, Onzu launches her Facebook page and WhatsApp system. Orders triple within months." },
    { year: '2022', title: 'Expanding the Menu', desc: "Croissants, sourdough, and macarons join the lineup. Partnered with delivery services to reach all of Dhaka." },
    { year: 'Today', title: '500+ Happy Families', desc: "Onzu's Kitchen now serves over 500 regular customers, shipping custom cakes for weddings and events." }
  ];

  return (
    <div className="z-content">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-20 px-4 text-center relative overflow-hidden hero-bg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(242,224,200,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="font-script text-honey text-2xl mb-2">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">Baked with <em className="text-honey not-italic">Love</em></h1>
          <p className="font-body text-biscuit/80 max-w-xl mx-auto leading-relaxed text-lg">
            From a tiny kitchen in Dhaka to hundreds of happy homes — this is how Onzu's Kitchen was born.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-cream overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-biscuit relative">
              <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=80" alt="Baking process" className="w-full h-96 object-cover"/>
            </div>
            <div className="mt-6 flex gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden shadow-lg h-32 border-2 border-white">
                <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80" alt="Breads" className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden shadow-lg h-32 border-2 border-white">
                <img src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80" alt="Cookies" className="w-full h-full object-cover"/>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-script text-caramel text-xl mb-3">How it all began</p>
            <h2 className="font-display text-4xl text-espresso mb-6 leading-tight">A Mother's Recipe,<br/><em>A Daughter's Dream</em></h2>
            <div className="space-y-4 font-body text-mocha/80 leading-relaxed text-base">
              <p>
                Onzu's Kitchen started in 2019 when Onzu — a passionate home baker — began sharing her late mother's cookie recipe with neighbours in Kazipara, Mirpur, Dhaka 1216, Bangladesh. What started as a small act of love quickly turned into something much bigger.
              </p>
              <p>
                Every weekend, the aroma of fresh bread and cinnamon rolls would drift through the alley. Neighbours would knock, friends would call, and soon strangers were placing orders. Onzu realised she wasn't just baking — she was creating moments of joy.
              </p>
              <p>
                Today, Onzu's Kitchen delivers fresh-baked goods across Dhaka, with every loaf, cake, and cookie still made by hand, in small batches, with premium ingredients — and always with that same original love.
              </p>
            </div>
            <div className="flex gap-8 mt-8 border-t border-biscuit pt-8">
              <div className="text-center">
                <p className="font-display text-honey text-3xl font-bold">2019</p>
                <p className="text-mocha/60 text-[10px] font-bold uppercase tracking-widest mt-1">Founded</p>
              </div>
              <div className="w-px bg-biscuit h-12"></div>
              <div className="text-center">
                <p className="font-display text-honey text-3xl font-bold">500+</p>
                <p className="text-mocha/60 text-[10px] font-bold uppercase tracking-widest mt-1">Happy Families</p>
              </div>
              <div className="w-px bg-biscuit h-12"></div>
              <div className="text-center">
                <p className="font-display text-honey text-3xl font-bold">40+</p>
                <p className="text-mocha/60 text-[10px] font-bold uppercase tracking-widest mt-1">Items</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 bg-biscuit/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-script text-caramel text-xl mb-2">What We Stand For</p>
            <h2 className="font-display text-4xl md:text-5xl text-espresso mb-4">Our <em>Values</em></h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-caramel/40"></div>
              <span className="text-caramel text-xl">✦</span>
              <div className="h-px w-16 bg-caramel/40"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="testi-card rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform">{v.icon}</div>
                <h3 className="font-display text-xl text-espresso mb-3">{v.title}</h3>
                <p className="font-body text-mocha/70 leading-relaxed text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-24 px-4 bg-cream">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-script text-caramel text-xl mb-2">How We Grew</p>
            <h2 className="font-display text-4xl text-espresso">Our <em>Journey</em></h2>
          </div>
          <div className="space-y-12">
            {timeline.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-4 h-4 rounded-full bg-caramel border-4 border-cream ring-2 ring-caramel shrink-0 mt-2"></div>
                  {i !== timeline.length - 1 && <div className="w-0.5 h-24 bg-caramel/30 mt-2"></div>}
                </div>
                <div>
                  <p className="font-script text-honey text-xl">{t.year}</p>
                  <h3 className="font-display text-2xl text-espresso mb-2">{t.title}</h3>
                  <p className="font-body text-mocha/70 text-base leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center hero-bg">
        <div className="max-w-2xl mx-auto">
          <p className="font-script text-honey text-2xl mb-3">Taste the Story</p>
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-5 leading-tight">Ready to Order?</h2>
          <p className="font-body text-biscuit/70 mb-8 leading-relaxed text-lg">
            Experience the warmth of Onzu's Kitchen in every bite. Browse our full menu and have it delivered fresh to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="bg-honey text-espresso font-bold text-sm px-10 py-4 rounded-full font-body tracking-wide hover:-translate-y-1 transition-all shadow-lg active:scale-95">
              Browse Our Menu
            </Link>
            <Link to="/contact" className="border-2 border-cream/40 hover:border-cream text-cream font-bold text-sm px-10 py-4 rounded-full transition-all hover:bg-cream/10 font-body tracking-wide active:scale-95">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon() {
  return (
    <div className="w-8 h-8 text-caramel flex items-center justify-center">
      <Sparkles className="w-8 h-8" />
    </div>
  );
}
