import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, LogIn, UserCheck, Shield, User, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsRole, isAuthenticated, isLoadingAuth } = useAuth();
  const [email, setEmail] = useState("admin@aidbridge.org");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirected = React.useRef(false);

  React.useEffect(() => {
    if (isAuthenticated && !isLoadingAuth && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/Dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/Dashboard", { replace: true });
    } catch (err) {
      setError("Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleLogin = async (role) => {
    let email = "admin@aidbridge.org";
    if (role === "COORDINATOR") email = "coordinator@aidbridge.org";
    if (role === "VOLUNTEER") email = "volunteer@aidbridge.org";

    setEmail(email);
    setPassword("password");
    setError("");
    setIsLoading(true);

    try {
      await login(email, "password");
      navigate("/Dashboard", { replace: true });
    } catch (err) {
      setError("Login failed. Check mock data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-bg selection:bg-blue-500/10">
      <Card className="w-full max-w-2xl glass border shadow-2xl overflow-hidden">
        <CardHeader className="space-y-3 pt-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-300">
              <img src="/logo.png" alt="AidBridge Logo" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-display text-center text-slate-900 tracking-tight">
            AidBridge Login
          </CardTitle>
          <p className="text-center text-sm text-slate-500 font-medium tracking-wide">
            Disaster Relief Coordination Platform
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-50 rounded-xl shadow-sm">
                  <AlertDescription className="text-red-700 text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8">
            <h3 className="text-[13px] font-bold text-slate-600 mb-4 tracking-tight uppercase">Select a Role to Test:</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleRoleLogin("ADMIN")} 
                className="h-12 rounded-xl border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all shadow-sm"
              >
                <Shield className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleRoleLogin("COORDINATOR")} 
                className="h-12 rounded-xl border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold transition-all shadow-sm"
              >
                <UserCheck className="w-4 h-4 mr-2" /> Coordinator
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleRoleLogin("VOLUNTEER")} 
                className="h-12 rounded-xl border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 font-bold transition-all shadow-sm"
              >
                <User className="w-4 h-4 mr-2" /> Volunteer
              </Button>
            </div>
            <div className="mt-4 space-y-1.5 text-[12px] font-medium text-slate-500 px-1">
              <p><span className="text-red-600 font-bold">Admin:</span> Full access to everything</p>
              <p><span className="text-blue-600 font-bold">Coordinator:</span> Manage disasters, survivors, volunteers</p>
              <p><span className="text-green-600 font-bold">Volunteer:</span> Limited - dashboard, locations, own profile</p>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">
              <span className="bg-[#fdfdff] px-4">OR LOGIN MANUALLY</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-slate-700 ml-1">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aidbridge.org"
                className="h-12 bg-slate-100/50 border-slate-200 focus:bg-white rounded-xl font-medium transition-all"
                required
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-slate-700 ml-1">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-slate-100/50 border-slate-200 focus:bg-white rounded-xl font-medium transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-slate-100/50 rounded-2xl text-[12px] font-medium text-slate-500 text-center border border-slate-100">
            <span className="font-bold text-slate-700">Note:</span> Demo environment with role-based access control.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
