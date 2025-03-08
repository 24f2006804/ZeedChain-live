'use client';

import { useState, useEffect, useRef } from 'react';

const Taskbar = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMouseNearBottom, setIsMouseNearBottom] = useState(false);
  const taskbarRef = useRef(null);
  const bottomThreshold = 100; // pixels from bottom to trigger taskbar
  
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      if (!isMouseNearBottom) {
        setIsVisible(false);
      }
    }, 3000);
    
    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const mouseY = e.clientY;
      
      // Check if mouse is near bottom of screen
      if (windowHeight - mouseY <= bottomThreshold) {
        setIsMouseNearBottom(true);
        setIsVisible(true);
      } else {
        setIsMouseNearBottom(false);
        if (!isMouseNearBottom) {
          setIsVisible(false);
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMouseNearBottom]);
  
  return (
    <div 
      ref={taskbarRef}
      className={`
        fixed bottom-0 left-0 right-0 
        h-14 
        transition-transform duration-300 ease-in-out
        flex items-center justify-center gap-4
        ${isVisible ? 'transform translate-y-0' : 'transform translate-y-full'}
      `}
    >
      {children}

    </div>
  );
};



export default Taskbar;
