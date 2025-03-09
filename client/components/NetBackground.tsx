"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VantaBackground = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).VANTA) {
      if (!vantaEffect && vantaRef.current) {
        setVantaEffect(
          (window as any).VANTA.NET({
            el: vantaRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x3f51b5,
            backgroundColor: 0x0,
            points: 8.00,
            maxDistance: 20.00,
            spacing: 16.00,
            showDots: false
          })
        );
      }
    }

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="h-full w-full absolute top-0 left-0" />;
};

export default VantaBackground;
