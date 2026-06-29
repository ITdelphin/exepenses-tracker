import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPieChart, FiShield, FiZap, FiGithub, FiCheckCircle } from 'react-icons/fi';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <FiPieChart className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              SmartTracker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Sign In</Link>
            <Link to="/register" className="btn-primary py-2 px-6">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold mb-6 inline-block">
              v1.0.0 is now live 🚀
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Master Your Money with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                AI-Powered Insights
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The professional expense tracker that gives you total control over your finances with automated reports, budget alerts, and smart analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group w-full sm:w-auto justify-center">
                Start Tracking Free <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://github.com/ITdelphin/exepenses-tracker" target="_blank" rel="noreferrer" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 group w-full sm:w-auto justify-center">
                <FiGithub size={20} /> View on GitHub
              </a>
            </div>
          </motion.div>

          {/* Visual Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 relative px-4"
          >
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-600 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt="App Dashboard"
                className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600 dark:text-gray-400">Professional tools for personal finance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                <FiZap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">Instantly log expenses and income. Categorize them with one click and see your balance update in real-time.</p>
            </div>
            <div className="card hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 text-left">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <FiPieChart size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Deep Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Visualize your spending patterns with beautiful interactive charts. Understand where your money goes every month.</p>
            </div>
            <div className="card hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 text-left">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <FiShield size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Military-grade Security</h3>
              <p className="text-gray-600 dark:text-gray-400">Your data is encrypted and stored securely in the cloud. Access your account safely from any device, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <FiShield size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy by Design</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We believe your financial data is yours alone. Our system architecture ensures total isolation:
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Admins cannot see your individual transactions</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Budgets and income are encrypted at the user level</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">System stats are aggregated anonymously</span>
                </div>
              </div>
            </div>
            <div className="flex-1 card border-green-200 dark:border-green-900/30 shadow-2xl">
              <h4 className="text-sm font-bold text-green-600 mb-4 tracking-widest uppercase">Encryption Status</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">User Data isolation</span>
                  <span className="text-green-500 font-mono text-sm font-bold">100% SECURE</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div className="bg-green-500 w-full h-full rounded-full"></div>
                </div>
                <p className="text-xs text-gray-500 italic">"Admins can only see system health and user counts. Your private numbers are never exposed."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panel Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Take Full Control</h2>
            <div className="space-y-4">
              {[
                { title: 'Budget Management', desc: 'Set monthly limits for specific categories and get notified when you are close to the edge.' },
                { title: 'Goal Tracking', desc: 'Save for your dreams. Track your progress towards multiple financial goals simultaneously.' },
                { title: 'Export Capabilities', desc: 'Download your data anytime. Support for PDF, CSV, and Excel exports for professional use.' },
                { title: 'Advanced Logging', desc: 'Detailed history of every transaction. Filter and search through years of data in seconds.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <FiCheckCircle className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-primary-600 to-indigo-600 p-1 rounded-2xl shadow-2xl transform rotate-1">
            <div className="bg-gray-900 rounded-xl p-6 text-white font-mono text-sm overflow-hidden">
              <div className="flex gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <p className="text-primary-400">$ smart-tracker auth --status</p>
              <p className="text-white mt-1">Authenticated as Delphin Ngarambe</p>
              <p className="text-primary-400 mt-4">$ smart-tracker reports generate --monthly</p>
              <p className="text-gray-400 mt-1">Analyzing 127 transactions...</p>
              <p className="text-green-400 mt-1">SUCCESS: Report generated. Total Savings: $1,240.50</p>
              <p className="text-primary-400 mt-4">$ _</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © 2026 SmartTracker by ITDelphin. All rights reserved. Your financial data, always private.
        </p>
      </footer>
    </div>
  );
}
