import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Shield, Clock, Star, CheckCircle2, ChevronDown, FileCheck, UploadCloud, Download, ArrowRight } from "lucide-react";

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700/50 rounded-2xl bg-white/50 dark:bg-slate-800/50 overflow-hidden mb-4 transition-all duration-300">
      <button 
        className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-slate-900 dark:text-slate-100">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-4 text-slate-600 dark:text-slate-400"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] pointer-events-none" />
      
      <div className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800/50 px-5 py-2 rounded-full mb-6 relative overflow-hidden group">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                The Ultimate Document Workspace
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Unleash Your Files with<br/>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                UniConvert
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              Transform, merge, and compress documents instantly. Experience pixel-perfect accuracy with our zero-cost, enterprise-grade engine.
            </p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
            >
              <Link
                to="/workspace"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xl py-5 px-10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.7)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                Start Magic Workspace <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-900 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-left text-sm text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-amber-400 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </span>
                Loved by 10,000+ users worldwide
              </div>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-2 block">Step by Step</span>
              <h2 className="text-4xl font-extrabold mb-4">How It Works</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Three simple steps to transform your files like a pro.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] border-t-2 border-dashed border-slate-300 dark:border-slate-700 z-0" />
              {[
                { icon: FileCheck, title: "1. Select Files", desc: "Drag & drop or click to upload your document or images.", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-200 dark:border-blue-800" },
                { icon: UploadCloud, title: "2. Choose Format", desc: "Select from our wide variety of 20+ file formats globally.", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/50", border: "border-indigo-200 dark:border-indigo-800" },
                { icon: Download, title: "3. Download", desc: "Instantly download the processed result locally right away.", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-200 dark:border-purple-800" },
              ].map((step, i) => (
                <div key={i} className={`relative z-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-10 rounded-3xl text-center border ${step.border} shadow-xl shadow-slate-200/50 dark:shadow-black/20 transform hover:-translate-y-2 transition-transform duration-300`}>
                  <div className={`w-24 h-24 ${step.bg} ${step.color} rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner`}>
                    <step.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Us</span>
              <h2 className="text-4xl font-extrabold mb-4">Built for speed, privacy, and accuracy.</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Discover the amazing features that make UniConvert the #1 choice.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Conversions happen in seconds thanks to our state-of-the-art optimized cloud engines." },
                { icon: Shield, title: "Bank-grade Security", desc: "All files are encrypted during transfer using SSL and permanently deleted after 1 hour." },
                { icon: Star, title: "Pixel Perfect", desc: "Advanced AI-driven algorithms ensure your original formatting stays exactly the same." },
                { icon: Clock, title: "24/7 Available", desc: "Our reliable platform is always online, ready to serve you whenever you might need it." },
                { icon: CheckCircle2, title: "100% Free", desc: "No hidden fees, no credit card required, no subscriptions. Completely free to use." },
                { icon: FileCheck, title: "Any Format", desc: "Comprehensive support for PDF, DOCX, PPTX, JPG, PNG, WEBP, and many more." },
              ].map((feature, i) => (
                <div key={i} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur border border-slate-200 dark:border-slate-700/50 p-8 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group cursor-default">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto pb-16"
          >
            <div className="text-center mb-12">
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-2 block">Support</span>
              <h2 className="text-4xl font-extrabold mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: "Is it really free?", a: "Yes, UniConvert is completely free to use without any hidden charges or surprise subscriptions. Enjoy limitless conversions." },
                { q: "Are my files safe?", a: "Absolutely. We use industry-standard 256-bit SSL encryption for all file transfers. All uploaded files are automatically and permanently deleted from our servers within 1 hour." },
                { q: "Is there a file size limit?", a: "Currently, we support files up to 10MB to ensure exceptionally fast processing times and optimal server resources for all users." },
                { q: "Can I use it on mobile?", a: "Yes! Our website is fully responsive, lightweight, and works perfectly on smartphones, tablets, and desktop computers." }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </motion.div>
        
        </div>
      </div>
    </div>
  );
};

export default Home;
