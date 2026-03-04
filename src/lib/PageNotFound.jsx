import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <p className="text-slate-400 mb-6">Page not found</p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
