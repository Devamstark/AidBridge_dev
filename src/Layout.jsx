import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { PageTransition } from "@/components/PageTransition";
import { I18nProvider, useTranslation } from "@/components/i18n/I18nContext";
import { useAuth } from "@/lib/AuthContext";
import Clock from "@/components/Clock";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  Truck,
  UserCheck,
  ShieldAlert,
  ClipboardList,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Wifi,
  WifiOff,
  Activity,
  ArrowLeft,
  Settings as SettingsIcon,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "nav.dashboard", page: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "COORDINATOR", "VOLUNTEER"] },
  { name: "nav.disasters", page: "Disasters", icon: Activity, roles: ["ADMIN", "COORDINATOR", "VOLUNTEER"] },
  { name: "nav.survivor_intake", page: "SurvivorIntake", icon: Users, roles: ["ADMIN", "COORDINATOR"] },
  { name: "nav.survivors", page: "Survivors", icon: ClipboardList, roles: ["ADMIN", "COORDINATOR"] },
  { name: "nav.locations", page: "Locations", icon: MapPin, roles: ["ADMIN", "COORDINATOR", "VOLUNTEER"] },
  { name: "nav.resources", page: "Resources", icon: Package, roles: ["ADMIN", "COORDINATOR"] },
  { name: "nav.distributions", page: "Distributions", icon: Truck, roles: ["ADMIN", "COORDINATOR"] },
  { name: "nav.volunteers", page: "Volunteers", icon: UserCheck, roles: ["ADMIN", "COORDINATOR"] },
  { name: "nav.volunteer_profiles", page: "VolunteerProfiles", icon: UserCheck, roles: ["ADMIN", "COORDINATOR", "VOLUNTEER"] },
  { name: "nav.break_glass", page: "BreakGlass", icon: ShieldAlert, roles: ["ADMIN"] },
  { name: "nav.emergency_dispatch", page: "EmergencyDispatch", icon: AlertTriangle, roles: ["ADMIN", "COORDINATOR"] },
];

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("app_preferences");
    if (stored) {
      const prefs = JSON.parse(stored);
      return prefs.theme || "dark";
    }
    return "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Apply theme
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Update preferences in localStorage
    const stored = localStorage.getItem("app_preferences");
    const prefs = stored ? JSON.parse(stored) : {};
    prefs.theme = newTheme;
    localStorage.setItem("app_preferences", JSON.stringify(prefs));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-slate-400 hover:text-white hover:bg-slate-700"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

const mobileNavigation = [
  { name: "nav.dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "nav.disasters", page: "Disasters", icon: Activity },
  { name: "nav.survivors", page: "Survivors", icon: ClipboardList },
  { name: "nav.settings", page: "Settings", icon: SettingsIcon },
];

const childPages = ["SurvivorIntake", "Locations", "Resources", "Distributions", "Volunteers", "BreakGlass"];

function LayoutContent({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const isChildPage = childPages.includes(currentPageName);
  const mainRef = useRef(null);
  const lastTapRef = useRef({ page: null, time: 0 });

  useEffect(() => {
    if (user) {
      const root = document.documentElement;

      // Apply saved font size from user DB
      if (user.fontSize) {
        root.classList.remove("font-small", "font-medium", "font-large", "font-xlarge");
        root.classList.add(`font-${user.fontSize}`);
        const fontSizeMap = {
          small: "14px",
          medium: "16px",
          large: "18px",
          xlarge: "20px"
        };
        root.style.setProperty("--base-font-size", fontSizeMap[user.fontSize] || "16px");
      }

      // Apply saved contrast from user DB
      if (user.contrast) {
        root.setAttribute("data-contrast", user.contrast);
      }
    }
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user]);

  const handleTabClick = (pageName) => {
    const now = Date.now();
    if (lastTapRef.current.page === pageName && now - lastTapRef.current.time < 500) {
      // Double tap detected - scroll to top
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    lastTapRef.current = { page: pageName, time: now };
  };

  return (
    <div className="min-h-screen transition-colors duration-200">
      <style>{`
        :root {
          /* AidBridge Red #D72836 */
          --primary: 355 69% 50%;
          --primary-foreground: 0 0% 100%;
          /* AidBridge Blue #2F4F79 */
          --secondary: 213 44% 33%;
          --secondary-foreground: 0 0% 100%;
          --base-font-size: 16px;
        }
        
        /* Font Size Classes */
        html.font-small { --base-font-size: 14px; }
        html.font-medium { --base-font-size: 16px; }
        html.font-large { --base-font-size: 18px; }
        html.font-xlarge { --base-font-size: 20px; }
        
        /* Apply base font size to body and scale everything */
        html { font-size: var(--base-font-size); }
        body {
          overscroll-behavior: none;
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Dark theme (default) - Standard Contrast — AidBridge deep navy */
        html, html.dark {
          color-scheme: dark;
        }
        html body, html.dark body {
          background-color: #0d1527;
          color: #dde4ef;
        }
        html .bg-slate-900, html.dark .bg-slate-900 { background-color: #0d1527; }
        html .bg-slate-800, html.dark .bg-slate-800 { background-color: #162040; }
        html .bg-slate-700, html.dark .bg-slate-700 { background-color: #1e2f55; }
        html .text-white, html.dark .text-white { color: #ffffff; }
        html .text-slate-300, html.dark .text-slate-300 { color: #cbd5e1; }
        html .text-slate-400, html.dark .text-slate-400 { color: #94a3b8; }
        html .text-slate-200, html.dark .text-slate-200 { color: #e2e8f0; }
        html .border-slate-700, html.dark .border-slate-700 { border-color: #334155; }
        html .border-slate-600, html.dark .border-slate-600 { border-color: #475569; }
        
        /* Enhanced Contrast */
        html[data-contrast="enhanced"] body,
        html.dark[data-contrast="enhanced"] body {
          background-color: #080f1e;
          color: #f1f5f9;
        }
        html[data-contrast="enhanced"] .bg-slate-900,
        html.dark[data-contrast="enhanced"] .bg-slate-900 { background-color: #080f1e; }
        html[data-contrast="enhanced"] .bg-slate-800,
        html.dark[data-contrast="enhanced"] .bg-slate-800 { background-color: #101b30; }
        html[data-contrast="enhanced"] .bg-slate-700,
        html.dark[data-contrast="enhanced"] .bg-slate-700 { background-color: #182840; }
        html[data-contrast="enhanced"] .text-white,
        html.dark[data-contrast="enhanced"] .text-white { color: #ffffff; }
        html[data-contrast="enhanced"] .text-slate-300,
        html.dark[data-contrast="enhanced"] .text-slate-300 { color: #e2e8f0; }
        html[data-contrast="enhanced"] .text-slate-400,
        html.dark[data-contrast="enhanced"] .text-slate-400 { color: #cbd5e1; }
        html[data-contrast="enhanced"] .text-slate-200,
        html.dark[data-contrast="enhanced"] .text-slate-200 { color: #f1f5f9; }
        html[data-contrast="enhanced"] .border-slate-700,
        html.dark[data-contrast="enhanced"] .border-slate-700 { border-color: #475569; }
        html[data-contrast="enhanced"] .border-slate-600,
        html.dark[data-contrast="enhanced"] .border-slate-600 { border-color: #64748b; }
        html[data-contrast="enhanced"] input:focus,
        html[data-contrast="enhanced"] select:focus,
        html[data-contrast="enhanced"] textarea:focus,
        html[data-contrast="enhanced"] button:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }
        
        /* High Contrast */
        html[data-contrast="high"] body,
        html.dark[data-contrast="high"] body {
          background-color: #000000;
          color: #ffffff;
        }
        html[data-contrast="high"] .bg-slate-900,
        html.dark[data-contrast="high"] .bg-slate-900 { background-color: #000000; }
        html[data-contrast="high"] .bg-slate-800,
        html.dark[data-contrast="high"] .bg-slate-800 { background-color: #0a0a0a; }
        html[data-contrast="high"] .bg-slate-700,
        html.dark[data-contrast="high"] .bg-slate-700 { background-color: #1a1a1a; }
        html[data-contrast="high"] .text-white,
        html.dark[data-contrast="high"] .text-white { color: #ffffff; }
        html[data-contrast="high"] .text-slate-300,
        html.dark[data-contrast="high"] .text-slate-300 { color: #f8fafc; }
        html[data-contrast="high"] .text-slate-400,
        html.dark[data-contrast="high"] .text-slate-400 { color: #e2e8f0; }
        html[data-contrast="high"] .text-slate-200,
        html.dark[data-contrast="high"] .text-slate-200 { color: #ffffff; }
        html[data-contrast="high"] .border-slate-700,
        html.dark[data-contrast="high"] .border-slate-700 { border-color: #64748b; }
        html[data-contrast="high"] .border-slate-600,
        html.dark[data-contrast="high"] .border-slate-600 { border-color: #94a3b8; }
        html[data-contrast="high"] input,
        html[data-contrast="high"] select,
        html[data-contrast="high"] textarea,
        html[data-contrast="high"] button {
          border-width: 2px;
        }
        html[data-contrast="high"] input:focus,
        html[data-contrast="high"] select:focus,
        html[data-contrast="high"] textarea:focus,
        html[data-contrast="high"] button:focus-visible {
          outline: 3px solid #60a5fa;
          outline-offset: 3px;
        }
        html[data-contrast="high"] a,
        html[data-contrast="high"] button {
          text-decoration-thickness: 2px;
        }
        
        /* Light theme - Standard Contrast — AidBridge off-white */
        html.light {
          color-scheme: light;
        }
        html.light body {
          background-color: #f5f7fa;
          color: #1a2035;
        }
        html.light .bg-slate-900 { background-color: #ffffff; }
        html.light .bg-slate-800 { background-color: #edf0f5; }
        html.light .bg-slate-700 { background-color: #dde3ee; }
        html.light .text-white { color: #1a2035; }
        html.light .text-slate-300 { color: #3b4a6b; }
        html.light .text-slate-200 { color: #2a3859; }
        html.light .text-slate-400 { color: #5a6e96; }
        html.light .border-slate-700 { border-color: #c5cfe0; }
        html.light .border-slate-600 { border-color: #dde3ee; }
        html.light .hover\\:bg-slate-700:hover { background-color: #dde3ee; }
        
        /* Light theme - Enhanced Contrast */
        html.light[data-contrast="enhanced"] body {
          background-color: #f1f5f9;
          color: #020617;
        }
        html.light[data-contrast="enhanced"] .bg-slate-900 { background-color: #ffffff; }
        html.light[data-contrast="enhanced"] .bg-slate-800 { background-color: #e2e8f0; }
        html.light[data-contrast="enhanced"] .bg-slate-700 { background-color: #cbd5e1; }
        html.light[data-contrast="enhanced"] .text-white { color: #020617; }
        html.light[data-contrast="enhanced"] .text-slate-300 { color: #334155; }
        html.light[data-contrast="enhanced"] .text-slate-200 { color: #1e293b; }
        html.light[data-contrast="enhanced"] .text-slate-400 { color: #475569; }
        html.light[data-contrast="enhanced"] .border-slate-700 { border-color: #94a3b8; }
        html.light[data-contrast="enhanced"] .border-slate-600 { border-color: #cbd5e1; }
        html.light[data-contrast="enhanced"] input:focus,
        html.light[data-contrast="enhanced"] select:focus,
        html.light[data-contrast="enhanced"] textarea:focus,
        html.light[data-contrast="enhanced"] button:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        
        /* Light theme - High Contrast */
        html.light[data-contrast="high"] body {
          background-color: #ffffff;
          color: #000000;
        }
        html.light[data-contrast="high"] .bg-slate-900 { background-color: #ffffff; }
        html.light[data-contrast="high"] .bg-slate-800 { background-color: #f5f5f5; }
        html.light[data-contrast="high"] .bg-slate-700 { background-color: #e5e5e5; }
        html.light[data-contrast="high"] .text-white { color: #000000; }
        html.light[data-contrast="high"] .text-slate-300 { color: #1a1a1a; }
        html.light[data-contrast="high"] .text-slate-200 { color: #0a0a0a; }
        html.light[data-contrast="high"] .text-slate-400 { color: #262626; }
        html.light[data-contrast="high"] .border-slate-700 { border-color: #525252; }
        html.light[data-contrast="high"] .border-slate-600 { border-color: #737373; }
        html.light[data-contrast="high"] input,
        html.light[data-contrast="high"] select,
        html.light[data-contrast="high"] textarea,
        html.light[data-contrast="high"] button {
          border-width: 2px;
        }
        html.light[data-contrast="high"] input:focus,
        html.light[data-contrast="high"] select:focus,
        html.light[data-contrast="high"] textarea:focus,
        html.light[data-contrast="high"] button:focus-visible {
          outline: 3px solid #1d4ed8;
          outline-offset: 3px;
        }
        html.light[data-contrast="high"] a,
        html.light[data-contrast="high"] button {
          text-decoration-thickness: 2px;
        }
        
        /* Disable text selection on interactive elements */
        button, a, [role="button"], [role="tab"] {
          user-select: none;
          -webkit-user-select: none;
        }
        
        /* Hide scrollbars globally for native look */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-700">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698e1e54aa89d7e86672a787/bc0f8c2e6_Gemini_Generated_Image_mubnhrmubnhrmubn.png"
              alt="AidBridge"
              className="h-9 w-auto object-contain"
            />
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Connection status */}
          <div className={cn(
            "mx-4 mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2",
            online ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800" : "bg-amber-900/50 text-amber-300 border border-amber-800"
          )}>
            {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {online ? t("common.connected") : t("common.working_offline")}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation
              .filter((item) => {
                // If no roles specified, show to all authenticated users
                if (!item.roles || item.roles.length === 0) return true;
                // Check if user's role is in the allowed list
                return item.roles.includes(user?.role);
              })
              .map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-red-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-white" : "text-slate-400")} />
                    {t(item.name)}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-200" />}
                  </Link>
                );
              })}
          </nav>

          {/* User footer */}
          {user && (
            <div className="border-t border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-200">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.fullName || "User"}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Link to={createPageUrl("Settings")} className="flex-1">
                  <button className="w-full h-9 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors">
                    <SettingsIcon className="w-3.5 h-3.5" />
                    {t("nav.settings")}
                  </button>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={() => logout()}
                    className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 h-14 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 flex items-center px-4"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center lg:hidden">
            {isChildPage ? (
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-slate-700">
                <ArrowLeft className="w-5 h-5 text-slate-200" />
              </button>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-700">
                <Menu className="w-5 h-5 text-slate-200" />
              </button>
            )}
            <div className="ml-3 flex items-center gap-2">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698e1e54aa89d7e86672a787/bc0f8c2e6_Gemini_Generated_Image_mubnhrmubnhrmubn.png"
                alt="AidBridge"
                className="h-7 w-auto object-contain"
              />
            </div>
          </div>

          {/* Desktop Back Button */}
          {isChildPage && (
            <button onClick={() => navigate(-1)} className="hidden lg:flex p-2 -ml-2 rounded-lg hover:bg-slate-700 items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t("common.back")}</span>
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <Clock />
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border",
              online ? "bg-emerald-900/50 text-emerald-300 border-emerald-800" : "bg-amber-900/50 text-amber-300 border-amber-800"
            )}>
              {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {online ? t("common.online") : t("common.offline")}
            </div>
            <div className="h-6 w-px bg-slate-700 mx-1 hidden lg:block" />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main
          ref={mainRef}
          className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto pb-24 lg:pb-8"
          style={{
            paddingLeft: 'max(1rem, env(safe-area-inset-left))',
            paddingRight: 'max(1rem, env(safe-area-inset-right))'
          }}
        >
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 lg:hidden"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)'
          }}
        >
          <div className="flex items-center justify-around px-2 pt-2 pb-1">
            {mobileNavigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => handleTabClick(item.page)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1",
                    isActive ? "text-red-400" : "text-slate-400 hover:text-slate-300"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-red-400")} />
                  <span className="text-[10px] font-medium">{t(item.name)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div >
    </div >
  );
}

export default function Layout({ children, currentPageName }) {
  const { user } = useAuth();
  const [userLanguage, setUserLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const language = user.language || "en";
      console.log("[i18n] User language from DB:", language);
      setUserLanguage(language);
      setLoading(false);
    } else {
      setUserLanguage("en");
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return null;
  }

  return (
    <I18nProvider initialLanguage={userLanguage}>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </I18nProvider>
  );
}