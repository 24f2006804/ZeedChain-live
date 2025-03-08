"use client";

const NoiseFilter = () => {
  return (
    <>
      <svg style={{ width: 0, height: 0, position: "absolute" }}>
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="6.29"
            numOctaves="6"
            stitchTiles="stitch"
          />
        </filter>
      </svg>
    </>
  );
};

export default NoiseFilter;
