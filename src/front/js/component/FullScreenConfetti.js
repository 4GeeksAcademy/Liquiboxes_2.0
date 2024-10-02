import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function FullScreenConfetti () {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Confetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
    />
  );
};