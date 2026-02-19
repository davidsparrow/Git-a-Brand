import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ to, duration = 1200, suffix = '', prefix = '', className = '' }: Props) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * to));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);

  return (
    <span className={className}>
      {prefix}{value}{suffix}
    </span>
  );
}
