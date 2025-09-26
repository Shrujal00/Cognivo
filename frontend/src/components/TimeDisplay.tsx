'use client';

import { useEffect, useState } from 'react';

interface TimeDisplayProps {
  timestamp: Date;
  className?: string;
}

export default function TimeDisplay({ timestamp, className }: TimeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return <div className={className}>--:--:--</div>;
  }

  return (
    <div className={className} suppressHydrationWarning>
      {timestamp.toLocaleTimeString()}
    </div>
  );
}