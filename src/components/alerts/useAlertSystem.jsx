import { useEffect, useRef, useCallback } from "react";

/**
 * Plays a short audible alarm using the Web Audio API.
 * pattern: "critical" = urgent beeps, "warning" = single tone
 */
export function playAlarmSound(pattern = "critical") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const beep = (startTime, duration, freq, gainVal) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    if (pattern === "critical") {
      // Urgent triple beep
      beep(now, 0.15, 880, 0.4);
      beep(now + 0.2, 0.15, 880, 0.4);
      beep(now + 0.4, 0.3, 1100, 0.5);
    } else {
      // Single warning tone
      beep(now, 0.3, 660, 0.3);
    }
  } catch (e) {
    console.warn("Audio alert failed:", e);
  }
}

/**
 * Sends a browser push notification if permission is granted.
 */
export function sendPushNotification(title, body, options = {}) {
  if (!("Notification" in window)) return;

  const send = () => {
    new Notification(title, {
      body,
      icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698e1e54aa89d7e86672a787/bc0f8c2e6_Gemini_Generated_Image_mubnhrmubnhrmubn.png",
      badge: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698e1e54aa89d7e86672a787/bc0f8c2e6_Gemini_Generated_Image_mubnhrmubnhrmubn.png",
      tag: options.tag || "aidbridge-alert",
      requireInteraction: options.requireInteraction ?? true,
      ...options,
    });
  };

  if (Notification.permission === "granted") {
    send();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") send();
    });
  }
}

/**
 * Hook to request notification permission on mount.
 */
export function useNotificationPermission() {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
}