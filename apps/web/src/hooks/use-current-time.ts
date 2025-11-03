import { useEffect, useState } from "react";

interface TimeOfDay {
  label: string;
  greeting: string;
}

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour < 5) return { label: "Night", greeting: "Good Night" };
  if (hour < 12) return { label: "Morning", greeting: "Good Morning" };
  if (hour < 17) return { label: "Afternoon", greeting: "Good Afternoon" };
  if (hour < 21) return { label: "Evening", greeting: "Good Evening" };
  return { label: "Night", greeting: "Good Night" };
};

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeOfDay = getTimeOfDay(currentTime.getHours());
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    currentTime,
    formattedTime,
    formattedDate,
    timeOfDay,
    hour: currentTime.getHours(),
    minute: currentTime.getMinutes(),
    second: currentTime.getSeconds(),
  };
};
