"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VantaBackground = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Vanta.js from CDN dynamically
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.fog.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!vantaEffect && vantaRef.current && (window as any).VANTA) {
        setVantaEffect(
          (window as any).VANTA.FOG({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0x383129,
            midtoneColor: 0x7e28ff,
            lowlightColor: 0x0,
            baseColor: 0x0,
            blurFactor: 0.82,
            speed: 3.70,
            zoom: 0.70,
            THREE, 
          })
        );
      }
    };

    return () => {
      if (vantaEffect) vantaEffect.destroy(); // Cleanup to prevent memory leaks
      document.body.removeChild(script);
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="h-screen w-full" />;
};

export default VantaBackground;
