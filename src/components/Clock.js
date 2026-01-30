'use client';

import { useEffect, useState } from 'react';
import { Clock as ClockIcon, Calendar } from 'lucide-react';

export default function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary px-6 py-4">
      <div className="flex items-center gap-2 text-black">
        <ClockIcon className="w-5 h-5 text-primary" />
        <span className="text-xl font-mono font-semibold">{time}</span>
      </div>
      <div className="flex items-center gap-2 text-black/80">
        <Calendar className="w-5 h-5 text-primary" />
        <span className="text-sm sm:text-base">{date}</span>
      </div>
    </div>
  );
}
