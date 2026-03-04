import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, LogIn, UserCheck, Shield, User } from "lucide-react";

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
    setError("");
    setIsLoading(true);
    try {
      await loginAsRole(role);
      navigate("/Dashboard", { replace: true });
    } catch (err) {
      setError("Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            AidBridge Login
          </CardTitle>
          <p className="text-center text-sm text-slate-400">
            Disaster Relief Coordination Platform
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 border-red-500 bg-red-950/50">
              <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Select a Role to Test:</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => handleRoleLogin("ADMIN")} className="border-red-600 text-red-400 hover:bg-red-950">
                <Shield className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button variant="outline" onClick={() => handleRoleLogin("COORDINATOR")} className="border-blue-600 text-blue-400 hover:bg-blue-950">
                <UserCheck className="w-4 h-4 mr-2" /> Coordinator
              </Button>
              <Button variant="outline" onClick={() => handleRoleLogin("VOLUNTEER")} className="border-green-600 text-green-400 hover:bg-green-950">
                <User className="w-4 h-4 mr-2" /> Volunteer
              </Button>
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <p><span className="text-red-400 font-semibold">Admin:</span> Full access to everything</p>
              <p><span className="text-blue-400 font-semibold">Coordinator:</span> Manage disasters, survivors, volunteers</p>
              <p><span className="text-green-400 font-semibold">Volunteer:</span> Limited - dashboard, locations, own profile</p>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-600"></div></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-400">Or login manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@aidbridge.org" className="bg-slate-700 border-slate-600 text-white" required />
            </div>
            <div>
              <Label className="text-slate-300">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-700 border-slate-600 text-white" required />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              <LogIn className="w-4 h-4 mr-2" /> {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg text-xs text-slate-400 text-center">
            <strong className="text-slate-300">Note:</strong> Demo environment with role-based access control.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
