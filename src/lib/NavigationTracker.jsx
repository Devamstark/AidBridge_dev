import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    console.log('[Navigation] Page view:', location.pathname);
  }, [location.pathname]);

  return null;
}
