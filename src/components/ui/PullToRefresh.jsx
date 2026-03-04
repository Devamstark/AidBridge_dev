import React, { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (refreshing || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPulling(true);
      setPullDistance(Math.min(distance, maxPull));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullDistance(0);
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity z-50"
        style={{
          height: pullDistance,
          opacity: pulling || refreshing ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <RefreshCw
            className={`w-5 h-5 text-blue-500 ${refreshing ? "animate-spin" : ""}`}
            style={{
              transform: `rotate(${progress * 3.6}deg)`,
            }}
          />
          <span className="text-xs text-slate-400">
            {refreshing ? "Refreshing..." : pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pulling || refreshing ? pullDistance : 0}px)`,
          transition: pulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}