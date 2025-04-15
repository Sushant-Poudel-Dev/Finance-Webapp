import { useState, useEffect } from "react";

const useCountAnimation = (end, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const stepSize = Math.max(10, Math.floor(end / 100)); // Dynamic step size based on final value

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const targetValue = Math.floor(
        progress * (end - startValue) + startValue
      );
      const currentValue = Math.min(
        targetValue - (targetValue % stepSize),
        end
      );

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we reach the exact final value
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

export default useCountAnimation;
