'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className="page-transition"
      style={{
        animation: isTransitioning ? 'pageEnter 0.5s ease-out' : 'none',
      }}
    >
      {children}
    </div>
  );
}
