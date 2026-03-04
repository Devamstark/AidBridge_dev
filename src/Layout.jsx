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
      return prefs.theme || "light";
    }
    return "light";
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
      className="text-muted-foreground hover:text-foreground hover:bg-accent"
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
          --base-font-size: 16px;
        }
        html.font-small { --base-font-size: 14px; }
        html.font-medium { --base-font-size: 16px; }
        html.font-large { --base-font-size: 18px; }
        html.font-xlarge { --base-font-size: 20px; }
        html { font-size: var(--base-font-size); }
        body {
          overscroll-behavior: none;
          padding-bottom: env(safe-area-inset-bottom);
        }
        button, a, [role="button"], [role="tab"] {
          user-select: none;
          -webkit-user-select: none;
        }
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
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-lg",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698e1e54aa89d7e86672a787/bc0f8c2e6_Gemini_Generated_Image_mubnhrmubnhrmubn.png"
              alt="AidBridge"
              className="h-9 w-auto object-contain"
            />
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Connection status */}
          <div className={cn(
            "mx-4 mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2",
            online ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800" : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800"
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
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    {t(item.name)}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                  </Link>
                );
              })}
          </nav>

          {/* User footer */}
          {user && (
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Link to={createPageUrl("Settings")} className="flex-1">
                  <button className="w-full h-9 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors">
                    <SettingsIcon className="w-3.5 h-3.5" />
                    {t("nav.settings")}
                  </button>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={() => logout()}
                    className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
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
          className="sticky top-0 z-30 h-14 bg-card/95 backdrop-blur-md border-b border-border flex items-center px-4 shadow-sm"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center lg:hidden">
            {isChildPage ? (
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-accent">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-accent">
                <Menu className="w-5 h-5 text-foreground" />
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
            <button onClick={() => navigate(-1)} className="hidden lg:flex p-2 -ml-2 rounded-lg hover:bg-accent items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t("common.back")}</span>
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <Clock />
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border",
              online ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800"
            )}>
              {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {online ? t("common.online") : t("common.offline")}
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden lg:block" />
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
          className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
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
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
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