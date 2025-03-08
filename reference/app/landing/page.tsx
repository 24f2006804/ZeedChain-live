import React from 'react'

const Landing = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <video
        className="h-full w-full rounded-lg shadow-lg border"
        src="/videos/blackhole.mp4"
        autoPlay
        loop
        muted
      />
    </div>
  )
}

export default Landing