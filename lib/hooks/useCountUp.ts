import { useEffect, useState } from 'react';

export function useCountUp(end: number, duration: number = 1000, delay: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const timeout = setTimeout(() => {
      let startTime: number | null = null;
      const startValue = 0;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + (end - startValue) * easeOut);

        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return count;
}
