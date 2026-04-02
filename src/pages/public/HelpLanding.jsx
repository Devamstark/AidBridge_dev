import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Search, Phone, ShieldAlert, Heart, Activity, Globe } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function HelpLanding() {
  return (
    <div className="min-h-screen mesh-bg selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-1 rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
              <img src="/logo.png" alt="AidBridge Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AidBridge</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Unified Disaster Response</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <a href="tel:911" className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-bold animate-pulse">
              <Phone className="w-4 h-4" />
              <span>Emergency 911</span>
            </a>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div 
              variants={item}
              className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-rose-500/20"
            >
              <Activity className="w-3.5 h-3.5" />
              Live Operations Dashboard Active
            </motion.div>
            
            <motion.h2 
              variants={item}
              className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
            >
              Real-time Help in <br />
              <span className="text-gradient">Disaster Situations.</span>
            </motion.h2>
            
            <motion.p 
              variants={item}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              AidBridge connects survivors with critical emergency services instantly. 
              No bureaucracy, just immediate humanitarian logistics.
            </motion.p>

            {/* Action Cards */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-3 gap-8 mt-12"
            >
              <motion.div variants={item}>
                <Card className="group glass border-none shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="pt-8 pb-8 px-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Critical Help</h3>
                    <p className="text-muted-foreground mb-8 text-balance">
                      Immediate extraction, medical aid, or emergency supplies for active danger zones.
                    </p>
                    <Link to="/help/request">
                      <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-lg hover:shadow-red-500/40 transition-all border-none">
                        Rescue Request
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="group glass border-none shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="pt-8 pb-8 px-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Survivor Portal</h3>
                    <p className="text-muted-foreground mb-8 text-balance">
                      Register as a survivor to receive government grants, shelter, and long-term aid.
                    </p>
                    <Link to="/register">
                      <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/40 transition-all border-none">
                        Register Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="group glass border-none shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="pt-8 pb-8 px-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Track Status</h3>
                    <p className="text-muted-foreground mb-8 text-balance">
                      Live GPS tracking and status updates for your rescue or relief request.
                    </p>
                    <Link to="/track">
                      <Button variant="outline" className="w-full h-12 text-lg font-bold border-2 hover:bg-muted/50 transition-all">
                        Check Status
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-primary/40 mx-auto mb-6" />
          <h2 className="text-2xl font-medium italic text-muted-foreground/80 leading-relaxed">
            "Direct communication between survivors and responders shouldn't be a luxury; it's a lifeline. AidBridge transforms chaos into coordination."
          </h2>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t glass">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-all">
            <img src="/logo.png" alt="AidBridge Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold">AidBridge Platform</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/login" className="hover:text-primary transition-colors">Responder Login</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>

          <p className="text-xs text-muted-foreground text-center md:text-right">
            © 2026 AidBridge Foundation. <br />
            Emergency Protocol: Call 911 immediately if in mortal danger.
          </p>
        </div>
      </footer>
    </div>
  );
}
