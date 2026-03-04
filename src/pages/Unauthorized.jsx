import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Access Denied
          </CardTitle>
          <p className="text-center text-sm text-slate-400">
            You don't have permission to access this page
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-300 text-center">
              This page requires higher privileges. Please contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link to="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                <LogIn className="w-4 h-4 mr-2" />
                Login with Different Account
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Error Code: 403 - Forbidden
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
