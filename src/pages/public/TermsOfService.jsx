import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, FileText, ArrowLeft, CheckCircle, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-bg py-12 px-4 selection:bg-rose-500/10">
      <div className="max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 text-muted-foreground hover:text-slate-900 hover:bg-white/50 rounded-full pl-2 pr-6"
          >
            <div className="p-1.5 rounded-full bg-white shadow-sm mr-3">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Home
          </Button>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="glass rounded-[2rem] p-8 md:p-16 shadow-2xl border-none relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-primary to-orange-500" />
          
          <motion.div variants={item} className="mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center mb-6">
              <img src="/logo.png" alt="AidBridge Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Last Updated: April 02, 2026</p>
          </motion.div>

          <div className="space-y-12">
            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Service Purpose
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  AidBridge is an emergency coordination platform designed for use during active disaster response. By accessing our platform, you acknowledge that you are using this service for legitimate humanitarian purposes only—either seeking emergency help or providing verified relief services.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                Emergency Use Only
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 text-rose-700 font-medium">
                  <strong>CRITICAL:</strong> False emergency requests through AidBridge are strictly prohibited and may be subject to severe criminal penalties under national disaster management acts.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Misuse:</strong> Purposely providing false geolocation data to divert emergency resources is a serious violation.</li>
                  <li><strong>Verification:</strong> Requests undergo real-time validation via satellite, localized mesh networks, and ground intel.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-indigo-500" />
                Limitation of Liability
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  While AidBridge utilizes cutting-edge distributed computing and real-time data sync, we cannot guarantee 100% service uptime during catastrophic infrastructure failure. The platform acts as a facilitation layer between survivors and responders.
                </p>
                <p>
                  AidBridge and its parent foundation are not liable for decisions made by third-party responders or government agencies following the initial dispatch through our platform.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Account Accountability
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  Responder accounts must maintain strictly authorized personnel access. Unauthorized disclosure of survivor information retrieved through the platform will result in immediate permanent account termination and legal action.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item} className="pt-8 border-t border-slate-200/50">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">
                © 2026 AidBridge Unified Disaster Response Foundation. All Rights Reserved.
              </p>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
