import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/api/client";
import { useTranslation } from "../components/i18n/I18nContext";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  User,
  Lock,
  Bell,
  Eye,
  Globe,
  Wifi,
  WifiOff,
  Palette,
  Accessibility,
  Settings as SettingsIcon,
  Info,
  Trash2,
  Download,
  RefreshCw,
  Check,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Save,
  UserX
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
  { label: "中文（简体）", value: "zh" },
  { label: "বাংলা", value: "bn" },
  { label: "Français", value: "fr" },
  { label: "Nederlands", value: "nl" }
];
const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "UTC", "Europe/London"];
const FONT_SIZES = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
  { label: "Extra Large", value: "xlarge" }
];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language, setLanguage, t } = useTranslation();
  const { user, updateUser, isLoading: loadingUser } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);

  // Form state for user profile
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
  });

  // Client-side preferences (localStorage)
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem("app_preferences");
    return stored ? JSON.parse(stored) : {
      theme: "auto",
      contrast: "standard",
      fontSize: "medium",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      timezone: "America/New_York",
      pushNotifications: true,
      emailNotifications: true,
      soundAlerts: true,
      analyticsOptIn: true,
      autoOffline: true,
      autoSync: true,
      syncFrequency: "immediate",
      syncOverCellular: false,
      storageLimit: "500MB",
      conflictResolution: "manual",
      liteMode: false,
      autoLiteMode: false,
      screenReader: false,
      reduceMotion: false,
      keyboardHints: false,
      focusIndicators: "standard",
      colorBlindMode: "none",
    };
  });

  const [storageUsed, setStorageUsed] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearCacheDialogOpen, setClearCacheDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Track if language was initialized to prevent re-setting on updates
  const [languageInitialized, setLanguageInitialized] = useState(false);
  const [fontSizeInitialized, setFontSizeInitialized] = useState(false);
  const [contrastInitialized, setContrastInitialized] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || "",
        phone: user.phone || "",
      });
      // Initialize language from user's DB setting ONLY ONCE
      if (user.language && !languageInitialized) {
        console.log("[i18n] User language from settings page:", user.language);
        setLanguage(user.language);
        setLanguageInitialized(true);
      }
      // Initialize font size from user's DB setting ONLY ONCE
      if (user.fontSize && !fontSizeInitialized) {
        console.log("[fontSize] User font size from DB:", user.fontSize);
        setPreferences(prev => ({ ...prev, fontSize: user.fontSize }));
        applyFontSize(user.fontSize);
        setFontSizeInitialized(true);
      }
      // Initialize contrast from user's DB setting ONLY ONCE
      if (user.contrast && !contrastInitialized) {
        console.log("[contrast] User contrast from DB:", user.contrast);
        setPreferences(prev => ({ ...prev, contrast: user.contrast }));
        applyContrast(user.contrast);
        setContrastInitialized(true);
      }
    }
  }, [user, setLanguage, languageInitialized, fontSizeInitialized, contrastInitialized]);

  // Apply theme on mount and when preferences change
  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  // Apply font size on mount and when preferences change
  useEffect(() => {
    applyFontSize(preferences.fontSize);
  }, [preferences.fontSize]);

  // Apply contrast on mount and when preferences change
  useEffect(() => {
    applyContrast(preferences.contrast);
  }, [preferences.contrast]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (preferences.theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("auto");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [preferences.theme]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("app_preferences", JSON.stringify(preferences));
  }, [preferences]);

  // Estimate storage usage
  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        const usedMB = ((usage || 0) / 1024 / 1024).toFixed(2);
        setStorageUsed(parseFloat(usedMB));
      });
    }
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast({ title: t("settings.profile_updated"), description: t("settings.profile_updated_desc"), duration: 4000 });
      setHasChanges(false);
    },
    onError: () => {
      toast({ title: t("settings.error"), description: t("settings.error_desc"), variant: "destructive", duration: 4000 });
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (language) => {
      console.log("[i18n] Saving language to DB:", language);
      return updateUser({ language });
    },
    onSuccess: (data, language) => {
      console.log("[i18n] Language saved successfully:", language);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      // Note: setLanguage is called in handleLanguageChange before mutation
      // Show success toast with the NEW language's translation
      setTimeout(() => {
        toast({ 
          title: t("settings.language_updated"), 
          description: t("settings.language_updated_desc"), 
          duration: 4000 
        });
      }, 100);
    },
    onError: () => {
      toast({ title: t("settings.error"), description: t("settings.error_desc"), variant: "destructive", duration: 4000 });
    },
  });

  const updateFontSizeMutation = useMutation({
    mutationFn: (fontSize) => {
      console.log("[fontSize] Saving font size to DB:", fontSize);
      return updateUser({ fontSize });
    },
    onSuccess: (data, fontSize) => {
      console.log("[fontSize] Font size saved successfully:", fontSize);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast({ title: t("settings.error"), description: t("settings.error_desc"), variant: "destructive", duration: 4000 });
    },
  });

  const updateContrastMutation = useMutation({
    mutationFn: (contrast) => {
      console.log("[contrast] Saving contrast to DB:", contrast);
      return updateUser({ contrast });
    },
    onSuccess: (data, contrast) => {
      console.log("[contrast] Contrast saved successfully:", contrast);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast({ title: t("settings.error"), description: t("settings.error_desc"), variant: "destructive", duration: 4000 });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profile);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Apply theme changes immediately
    if (key === "theme") {
      applyTheme(value);
    }

    // Apply and persist font size changes immediately
    if (key === "fontSize") {
      applyFontSize(value);
      updateFontSizeMutation.mutate(value);
    }

    // Apply and persist contrast changes immediately
    if (key === "contrast") {
      applyContrast(value);
      updateContrastMutation.mutate(value);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    console.log("[i18n] Language change requested:", newLanguage);
    // Set language immediately for UI responsiveness
    setLanguage(newLanguage);
    // Then persist to DB
    updateLanguageMutation.mutate(newLanguage);
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    } else if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const applyFontSize = (fontSize) => {
    const root = document.documentElement;
    
    // Remove all font size classes
    root.classList.remove("font-small", "font-medium", "font-large", "font-xlarge");
    
    // Add the new font size class
    root.classList.add(`font-${fontSize}`);
    
    // Set CSS variable for more granular control
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
      xlarge: "20px"
    };
    root.style.setProperty("--base-font-size", fontSizeMap[fontSize] || "16px");
  };

  const applyContrast = (contrast) => {
    const root = document.documentElement;
    
    // Set data attribute for contrast mode
    root.setAttribute("data-contrast", contrast);
  };

  const handleClearCache = () => setClearCacheDialogOpen(true);

  const confirmClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({ title: "Cache cleared", description: "All cached data removed." });
    setTimeout(() => window.location.reload(), 1000);
    setClearCacheDialogOpen(false);
  };

  const handleSyncNow = () => {
    toast({ title: "Syncing...", description: "Synchronizing data with server.", duration: 2000 });
    setTimeout(() => {
      setPendingChanges(0);
      toast({ title: "Sync complete", description: "All changes have been synchronized.", duration: 4000 });
    }, 2000);
  };

  const handleExportData = async () => {
    toast({ title: "Exporting...", description: "Preparing your data for download.", duration: 2000 });
    const data = {
      user: user,
      preferences: preferences,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aidbridge-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => {
      toast({ title: "Export complete", description: "Your data has been downloaded.", duration: 4000 });
    }, 500);
  };

  const handleDeleteAccount = () => {
    toast({ title: "Account Deletion Requested", description: "Contact support to complete account deletion.", variant: "destructive", duration: 5000 });
    setDeleteDialogOpen(false);
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
        actions={
          hasChanges && (
            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? t("settings.saving") : t("settings.save_changes")}
            </Button>
          )
        }
      />

      <div className="max-w-4xl">
        <Accordion type="multiple" defaultValue={["account", "appearance"]} className="space-y-4">
          {/* ACCOUNT SETTINGS */}
          <AccordionItem value="account" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.account")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.account_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                {/* Profile */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> {t("settings.profile_info")}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">{t("settings.full_name")}</Label>
                      <Input
                        value={profile.full_name}
                        onChange={(e) => { setProfile({ ...profile, full_name: e.target.value }); setHasChanges(true); }}
                        placeholder="Enter your full name"
                        className="bg-secondary border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("settings.email")}</Label>
                      <Input value={user.email} disabled className="bg-secondary/50 text-muted-foreground border" />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("settings.phone")}</Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => { setProfile({ ...profile, phone: e.target.value }); setHasChanges(true); }}
                        placeholder="(555) 123-4567"
                        className="bg-secondary border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label>{t("settings.role")}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* APPLICATION SETTINGS */}
          <AccordionItem value="appearance" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-900/30 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.appearance")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.appearance_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-muted-foreground">{t("settings.theme")}</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { value: "light", icon: Sun, label: t("settings.light") },
                      { value: "dark", icon: Moon, label: t("settings.dark") },
                      { value: "auto", icon: Monitor, label: t("settings.auto") }
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => handlePreferenceChange("theme", value)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          preferences.theme === value ? "border-blue-500 bg-blue-600" : "border hover:border-slate-500 bg-secondary/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${preferences.theme === value ? "text-foreground" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${preferences.theme === value ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("settings.color_contrast")}</Label>
                  <Select value={preferences.contrast} onValueChange={(v) => handlePreferenceChange("contrast", v)}>
                    <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{t("settings.standard")}</SelectItem>
                      <SelectItem value="enhanced">{t("settings.enhanced")}</SelectItem>
                      <SelectItem value="high">{t("settings.high_contrast")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("settings.font_size")}</Label>
                  <Select value={preferences.fontSize} onValueChange={(v) => handlePreferenceChange("fontSize", v)}>
                    <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* LANGUAGE & REGION */}
          <AccordionItem value="language" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.language_region")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.language_region_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-muted-foreground">{t("settings.display_language")}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {updateLanguageMutation.isPending && (
                    <p className="text-xs text-muted-foreground mt-2">{t("settings.saving")}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t("settings.date_format")}</Label>
                    <Select value={preferences.dateFormat} onValueChange={(v) => handlePreferenceChange("dateFormat", v)}>
                      <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("settings.time_format")}</Label>
                    <Select value={preferences.timeFormat} onValueChange={(v) => handlePreferenceChange("timeFormat", v)}>
                      <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">{t("settings.hour_12")}</SelectItem>
                        <SelectItem value="24h">{t("settings.hour_24")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("settings.timezone")}</Label>
                  <Select value={preferences.timezone} onValueChange={(v) => handlePreferenceChange("timezone", v)}>
                    <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* NOTIFICATIONS */}
          <AccordionItem value="notifications" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-900/30 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.notifications")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.notifications_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                {[
                  { key: "pushNotifications", labelKey: "settings.push_notifications", descKey: "settings.push_notifications_desc" },
                  { key: "emailNotifications", labelKey: "settings.email_notifications", descKey: "settings.email_notifications_desc" },
                  { key: "soundAlerts", labelKey: "settings.sound_alerts", descKey: "settings.sound_alerts_desc" },
                ].map(({ key, labelKey, descKey }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm text-foreground">{t(labelKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(descKey)}</p>
                    </div>
                    <Switch checked={preferences[key]} onCheckedChange={(v) => handlePreferenceChange(key, v)} />
                  </div>
                ))}
                <Alert className="bg-red-900/30 border-red-700">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-sm text-red-300">
                    {t("settings.break_glass_alert")}
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* OFFLINE & SYNC */}
          <AccordionItem value="offline" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-900/30 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.offline_sync")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.offline_sync_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                {/* Offline Mode */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("settings.offline_mode")}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">{t("settings.auto_offline")}</p>
                        <p className="text-xs text-muted-foreground">{t("settings.auto_offline_desc")}</p>
                      </div>
                      <Switch checked={preferences.autoOffline} onCheckedChange={(v) => handlePreferenceChange("autoOffline", v)} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">{t("settings.lite_mode")}</p>
                        <p className="text-xs text-muted-foreground">{t("settings.lite_mode_desc")}</p>
                      </div>
                      <Switch checked={preferences.liteMode} onCheckedChange={(v) => handlePreferenceChange("liteMode", v)} />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("settings.storage_limit")}</Label>
                      <Select value={preferences.storageLimit} onValueChange={(v) => handlePreferenceChange("storageLimit", v)}>
                        <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100MB">100 MB</SelectItem>
                          <SelectItem value="500MB">500 MB</SelectItem>
                          <SelectItem value="1GB">1 GB</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-muted-foreground">{t("settings.storage_used")}</Label>
                        <span className="text-xs text-muted-foreground">{storageUsed} MB</span>
                      </div>
                      {(() => {
                        const parsedLimit = preferences.storageLimit === '1GB' ? 1024
                          : preferences.storageLimit === '100MB' ? 100
                          : preferences.storageLimit === 'unlimited' ? Infinity
                          : 500;
                        const storagePercent = parsedLimit === Infinity ? 0
                          : Math.min((storageUsed / parsedLimit) * 100, 100);
                        return <Progress value={storagePercent} className="h-2 bg-secondary" />;
                      })()}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sync Settings */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("settings.sync_settings")}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">{t("settings.auto_sync")}</p>
                        <p className="text-xs text-muted-foreground">{t("settings.auto_sync_desc")}</p>
                      </div>
                      <Switch checked={preferences.autoSync} onCheckedChange={(v) => handlePreferenceChange("autoSync", v)} />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("settings.sync_frequency")}</Label>
                      <Select value={preferences.syncFrequency} onValueChange={(v) => handlePreferenceChange("syncFrequency", v)}>
                        <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">{t("settings.immediate")}</SelectItem>
                          <SelectItem value="5min">{t("settings.every_5_min")}</SelectItem>
                          <SelectItem value="15min">{t("settings.every_15_min")}</SelectItem>
                          <SelectItem value="manual">{t("settings.manual_only")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">{t("settings.sync_cellular")}</p>
                        <p className="text-xs text-muted-foreground">{t("settings.sync_cellular_desc")}</p>
                      </div>
                      <Switch checked={preferences.syncOverCellular} onCheckedChange={(v) => handlePreferenceChange("syncOverCellular", v)} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-foreground">{t("settings.pending_changes")}</p>
                        <p className="text-xs text-muted-foreground">{t("settings.pending_changes_desc")}</p>
                      </div>
                      <Badge variant="outline">{pendingChanges}</Badge>
                    </div>
                    <Button onClick={handleSyncNow} variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" /> {t("settings.sync_now")}
                    </Button>
                    <div>
                      <Label className="text-muted-foreground">{t("settings.conflict_resolution")}</Label>
                      <Select value={preferences.conflictResolution} onValueChange={(v) => handlePreferenceChange("conflictResolution", v)}>
                        <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">{t("settings.manual_review")}</SelectItem>
                          <SelectItem value="server">{t("settings.server_wins")}</SelectItem>
                          <SelectItem value="local">{t("settings.local_wins")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ACCESSIBILITY */}
          <AccordionItem value="accessibility" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-900/30 flex items-center justify-center">
                  <Accessibility className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.accessibility")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.accessibility_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                {[
                  { key: "screenReader", labelKey: "settings.screen_reader", descKey: "settings.screen_reader_desc" },
                  { key: "reduceMotion", labelKey: "settings.reduce_motion", descKey: "settings.reduce_motion_desc" },
                  { key: "keyboardHints", labelKey: "settings.keyboard_hints", descKey: "settings.keyboard_hints_desc" },
                ].map(({ key, labelKey, descKey }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm text-foreground">{t(labelKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(descKey)}</p>
                    </div>
                    <Switch checked={preferences[key]} onCheckedChange={(v) => handlePreferenceChange(key, v)} />
                  </div>
                ))}
                <div>
                  <Label className="text-muted-foreground">{t("settings.focus_indicators")}</Label>
                  <Select value={preferences.focusIndicators} onValueChange={(v) => handlePreferenceChange("focusIndicators", v)}>
                    <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{t("settings.standard")}</SelectItem>
                      <SelectItem value="enhanced">{t("settings.enhanced")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("settings.color_blind_mode")}</Label>
                  <Select value={preferences.colorBlindMode} onValueChange={(v) => handlePreferenceChange("colorBlindMode", v)}>
                    <SelectTrigger className="mt-2 bg-secondary border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("settings.none")}</SelectItem>
                      <SelectItem value="protanopia">{t("settings.protanopia")}</SelectItem>
                      <SelectItem value="deuteranopia">{t("settings.deuteranopia")}</SelectItem>
                      <SelectItem value="tritanopia">{t("settings.tritanopia")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* PRIVACY & DATA */}
          <AccordionItem value="privacy" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-900/30 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.privacy")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.privacy_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{t("settings.analytics_optin")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.analytics_optin_desc")}</p>
                  </div>
                  <Switch checked={preferences.analyticsOptIn} onCheckedChange={(v) => handlePreferenceChange("analyticsOptIn", v)} />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" /> {t("settings.download_data")}
                  </Button>
                  <Button onClick={handleClearCache} variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700">
                    <Trash2 className="w-4 h-4 mr-2" /> {t("settings.clear_cache")}
                  </Button>
                  <Button onClick={() => setDeleteDialogOpen(true)} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 border-red-600">
                    <UserX className="w-4 h-4 mr-2" /> {t("settings.delete_account")}
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ABOUT & HELP */}
          <AccordionItem value="about" className="bg-card rounded-lg border border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t("settings.about")}</h3>
                  <p className="text-xs text-muted-foreground">{t("settings.about_desc")}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-secondary rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.version")}</span>
                    <span className="font-medium text-foreground">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.build_date")}</span>
                    <span className="font-medium text-foreground">2026-02-12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.platform")}</span>
                    <span className="font-medium text-foreground">Vite + React + Vercel</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="#" className="block p-3 rounded-lg hover:bg-secondary text-sm font-medium text-blue-400">
                    {t("settings.terms_of_service")} →
                  </a>
                  <a href="#" className="block p-3 rounded-lg hover:bg-secondary text-sm font-medium text-blue-400">
                    {t("settings.privacy_policy")} →
                  </a>
                  <a href="mailto:support@aidbridge.org" className="block p-3 rounded-lg hover:bg-secondary text-sm font-medium text-blue-400">
                    {t("settings.contact_support")} →
                  </a>
                  <a href="#" className="block p-3 rounded-lg hover:bg-secondary text-sm font-medium text-blue-400">
                    {t("settings.report_bug")} →
                  </a>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Clear Cache AlertDialog */}
      <AlertDialog open={clearCacheDialogOpen} onOpenChange={setClearCacheDialogOpen}>
        <AlertDialogContent className="bg-card border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Clear Local Cache
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will clear all locally cached data. This cannot be undone and the page will reload.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border text-foreground hover:bg-slate-600">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearCache} className="bg-amber-600 hover:bg-amber-700 text-foreground">
              Confirm Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteConfirmText(""); }}>
        <DialogContent className="max-w-md bg-card border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t("settings.delete_account_title")}
            </DialogTitle>
            <DialogDescription className="pt-2 text-muted-foreground">
              {t("settings.delete_account_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert className="bg-red-900/30 border-red-700">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-sm text-red-300">
                {t("settings.delete_account_warning")}
              </AlertDescription>
            </Alert>
            <Label className="text-muted-foreground text-sm">Type DELETE to confirm</Label>
            <Input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="bg-secondary border-red-700 text-foreground mt-2"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteConfirmText !== "DELETE"}>
              {t("settings.delete_my_account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}