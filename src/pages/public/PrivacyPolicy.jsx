import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText, ArrowLeft, Heart } from "lucide-react";
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

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-bg py-12 px-4 selection:bg-primary/20">
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
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-primary to-indigo-500" />
          
          <motion.div variants={item} className="mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center mb-6">
              <img src="/logo.png" alt="AidBridge Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Last Updated: April 02, 2026</p>
          </motion.div>

          <div className="space-y-12">
            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-500" />
                Data Collection in Emergencies
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  AidBridge collects minimal but essential data to facilitate emergency disaster response. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Geographic Location:</strong> Precise GPS coordinates to guide rescue teams to your exact position during a crisis.</li>
                  <li><strong>Identity Information:</strong> Name and contact details to verify request authenticity and maintain communication with responders.</li>
                  <li><strong>Incident Intel:</strong> Descriptions of the emergency situation to ensure appropriate personnel and equipment are deployed.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-emerald-500" />
                Information Security
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  In disaster scenarios, data integrity is a matter of life and death. We utilize military-grade end-to-end encryption for all sensitive communication between survivors and the dispatcher network. Your data is stored in specialized, high-availability data centers designed to remain online during regional infrastructure failures.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-500" />
                Data Sharing
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  Your information is shared EXCLUSIVELY with verified emergency responders, registered NGO relief teams, and relevant government disaster management agencies (like NDMA/SDRF). We never sell, lease, or distribute your information to private commercial entities or advertisers.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item} className="pt-8 border-t border-slate-200/50">
              <div className="bg-primary/5 rounded-2xl p-8 text-center">
                <Heart className="w-10 h-10 text-primary/40 mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-700 max-w-lg mx-auto">
                  Our commitment to privacy is absolute. We operate under the "Principle of Least Privilege," ensuring only the responders assigned to your case see your data.
                </p>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
