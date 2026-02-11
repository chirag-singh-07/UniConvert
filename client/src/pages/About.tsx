import { motion } from "framer-motion";
import { FileText, Zap, Shield, Clock, Github, Mail } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Convert your documents in seconds with our optimized conversion engine.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description:
        "Your files are processed securely and automatically deleted after 1 hour.",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Multiple Formats",
      description: "Support for DOCX, PDF, PPT, Excel, JPG, PNG, and more.",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Auto Cleanup",
      description:
        "Files are automatically removed from our servers to protect your privacy.",
    },
  ];

  const conversions = [
    "DOCX to PDF",
    "PDF to DOCX",
    "PPT to PDF",
    "Excel to PDF",
    "Image to PDF",
    "Merge PDFs",
    "Compress PDF",
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            About UniConvert
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            A modern, full-stack document conversion platform built for college
            projects. Convert, merge, and compress documents with ease.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-slate-100">
            Why Choose UniConvert?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="glass-card p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Supported Conversions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-slate-100">
            Supported Conversions
          </h2>
          <div className="glass-card p-8 rounded-2xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {conversions.map((conversion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {conversion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-slate-100">
            Built With Modern Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Frontend
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• React 18 with TypeScript</li>
                <li>• Vite for blazing-fast builds</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Framer Motion for animations</li>
                <li>• React Dropzone for file uploads</li>
              </ul>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Backend
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• Node.js with Express</li>
                <li>• TypeScript for type safety</li>
                <li>• MongoDB for data storage</li>
                <li>• LibreOffice for conversions</li>
                <li>• Ghostscript for PDF compression</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 rounded-2xl text-center"
        >
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Your Privacy Matters
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
            All uploaded files are automatically deleted from our servers after
            1 hour. We don't store, share, or analyze your documents. Your data
            remains private and secure.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
              <span className="text-green-700 dark:text-green-400 font-semibold">
                ✓ Auto-delete enabled
              </span>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
              <span className="text-green-700 dark:text-green-400 font-semibold">
                ✓ Secure processing
              </span>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            Get In Touch
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This is a college project. Feel free to reach out for questions or
            feedback!
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="mailto:your-email@example.com"
              className="btn-secondary flex items-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Email Us</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
