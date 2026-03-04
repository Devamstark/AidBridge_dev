import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Search, Phone, ShieldAlert } from "lucide-react";

export default function HelpLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">AidBridge</h1>
              <p className="text-xs text-muted-foreground">Emergency Response</p>
            </div>
          </div>
          <a href="tel:911" className="flex items-center gap-2 text-primary font-semibold">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">911</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            Need immediate help? Request assistance now
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get Help When Disaster Strikes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with emergency responders and track your requests - no login required
          </p>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Emergency Help</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Request immediate assistance for medical, rescue, shelter, or food
                </p>
                <Link to="/help/request">
                  <Button className="w-full bg-destructive hover:bg-destructive/90">
                    Request Help
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Register as Survivor</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register yourself and family for long-term assistance
                </p>
                <Link to="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Register Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Track Request</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check the status of your help request or registration
                </p>
                <Link to="/track">
                  <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                    Track Status
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link to="/login">
            <Button variant="outline" className="mb-4">
              Staff Login
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            For life-threatening emergencies, call <a href="tel:911" className="text-primary font-semibold">911</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
