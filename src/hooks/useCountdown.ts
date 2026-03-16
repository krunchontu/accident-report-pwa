import { useState, useEffect, useRef } from 'react';
import { differenceInSeconds, addHours, isPast } from 'date-fns';

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
  label: string;
}

export function useCountdown(incidentTime: string, deadlineHours: number): CountdownState {
  const [state, setState] = useState<CountdownState>({
    hours: 0, minutes: 0, seconds: 0, isOverdue: false, label: '',
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const deadline = addHours(new Date(incidentTime), deadlineHours);

    const update = () => {
      if (isPast(deadline)) {
        setState({ hours: 0, minutes: 0, seconds: 0, isOverdue: true, label: 'OVERDUE' });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      const totalSec = differenceInSeconds(deadline, new Date());
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      const label = hours >= 24
        ? `${Math.floor(hours / 24)}d ${hours % 24}h ${minutes}m`
        : `${hours}h ${minutes}m ${seconds}s`;
      setState({ hours, minutes, seconds, isOverdue: false, label });
    };

    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [incidentTime, deadlineHours]);

  return state;
}
