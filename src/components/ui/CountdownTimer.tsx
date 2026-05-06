import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.total <= 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <span className="text-gray-500 text-[10px]">Ends in</span>
      <span className="bg-brand-dark text-white px-1.5 py-0.5 rounded font-bold">{String(timeLeft.days).padStart(3, '0')}d</span>
      <span className="text-gray-400">:</span>
      <span className="bg-brand-dark text-white px-1.5 py-0.5 rounded font-bold">{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span className="text-gray-400">:</span>
      <span className="bg-brand-dark text-white px-1.5 py-0.5 rounded font-bold">{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span className="text-gray-400">:</span>
      <span className="bg-brand-dark text-white px-1.5 py-0.5 rounded font-bold">{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  );
}

function getTimeLeft(endDate: Date) {
  const total = Math.max(0, endDate.getTime() - Date.now());
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
