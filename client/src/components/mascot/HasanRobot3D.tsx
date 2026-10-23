import React, { useState, useEffect } from 'react';

export type MascotState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HasanRobot3DProps {
  state: MascotState;
  mouthAmplitude?: number; // 0.0 to 1.0 (lip-sync audio bounce)
  isSophiaMode?: boolean;
  theme?: 'dark' | 'light' | 'sophia';
  size?: number; // width/height in px
}

export const HasanRobot3D: React.FC<HasanRobot3DProps> = ({
  state,
  mouthAmplitude = 0,
  size = 220
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Subtle interactive mouse / touch tilt tracking
  const handleMove = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const x = ((clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 12;
    const y = ((clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 8;
    setTilt({ x: Math.max(-12, Math.min(12, x)), y: Math.max(-8, Math.min(8, y)) });
  };

  // Natural anime blinking loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  // Proportional calculations based on size
  const scale = size / 220;
  const mouthHeight = state === 'speaking' ? Math.max(6, mouthAmplitude * 16) : 3;
  const mouthWidth = state === 'speaking' ? Math.max(16, 14 + mouthAmplitude * 14) : 14;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `perspective(600px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY, e.currentTarget)}
      onTouchMove={(e) => {
        if (e.touches && e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
        }
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative flex items-center justify-center select-none pointer-events-none cursor-pointer"
      title="হাসান কিউট বাচ্চা রোবট"
    >
      {/* Soft Ambient Baby Halo Glow */}
      <div
        className="absolute rounded-full pointer-events-none blur-2xl transition-all duration-300"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          backgroundColor:
            state === 'listening'
              ? 'rgba(56, 189, 248, 0.35)'
              : state === 'thinking'
              ? 'rgba(251, 191, 36, 0.3)'
              : 'rgba(255, 107, 157, 0.25)'
        }}
      />

      {/* Main Mascot Floating Figure */}
      <div className="relative flex flex-col items-center justify-center w-full h-full animate-robot-levitate">
        
        {/* 1. Bouncy Antenna with Glowing Pink Heart */}
        <div className="relative flex flex-col items-center -mb-1.5 z-20">
          <div
            className={`rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              state === 'listening'
                ? 'bg-sky-400 animate-ping'
                : state === 'thinking'
                ? 'bg-amber-300 animate-pulse'
                : 'bg-pink-400 animate-pulse'
            }`}
            style={{
              width: 18 * scale,
              height: 18 * scale,
              boxShadow: '0 0 16px #ff6b9d'
            }}
          >
            <span style={{ fontSize: 10 * scale }}>❤️</span>
          </div>
          <div
            className="bg-gradient-to-b from-sky-300 to-sky-400 rounded-full"
            style={{ width: 4 * scale, height: 14 * scale }}
          />
        </div>

        {/* 2. Chubby Pearlescent White Baby Head with Headphone Ears */}
        <div className="relative flex items-center justify-center z-10">
          
          {/* Left Headphone Ear */}
          <div
            className="rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-md border-2 border-white -mr-2.5 z-0"
            style={{
              width: 26 * scale,
              height: 38 * scale,
              boxShadow: '0 0 12px rgba(0, 223, 216, 0.5)'
            }}
          />

          {/* Chubby White Porcelain Head Shell */}
          <div
            className="relative rounded-[2.6rem] p-2.5 flex flex-col items-center justify-center border-2 border-sky-100/80 bg-gradient-to-b from-white via-sky-50/50 to-white shadow-2xl z-10"
            style={{
              width: 142 * scale,
              height: 106 * scale,
              boxShadow:
                '0 12px 30px rgba(56, 189, 248, 0.22), 0 0 24px rgba(255, 107, 157, 0.18)'
            }}
          >
            {/* Cute Rounded Dark Visor Screen */}
            <div
              className="w-full h-full bg-[#0a1128] rounded-[2rem] relative flex items-center justify-around px-3 border border-cyan-400/40 overflow-hidden shadow-inner"
            >
              {/* Glossy Top Glass Curved Reflection */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 via-white/10 to-transparent pointer-events-none rounded-t-[2rem]" />

              {/* LEFT SPARKLING ANIME EYE */}
              <div className="relative flex items-center justify-center">
                {isBlinking ? (
                  /* Happy Crescent Smile Blink: ^ */
                  <div
                    className="border-b-[3px] border-cyan-300 rounded-full"
                    style={{ width: 22 * scale, height: 10 * scale }}
                  />
                ) : (
                  /* Big Shiny Anime Eye with Catchlight Stars */
                  <div
                    className="rounded-full bg-gradient-to-b from-cyan-300 via-cyan-400 to-sky-500 flex items-center justify-center relative shadow-[0_0_14px_#00dfd8] transition-transform duration-200"
                    style={{
                      width: 22 * scale,
                      height: 24 * scale,
                      transform: state === 'speaking' ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    {/* Big white catchlight circle */}
                    <div
                      className="absolute rounded-full bg-white shadow-sm"
                      style={{
                        top: 2.5 * scale,
                        right: 2.5 * scale,
                        width: 9 * scale,
                        height: 9 * scale
                      }}
                    />
                    {/* Small twinkle catchlight */}
                    <div
                      className="absolute rounded-full bg-white/90"
                      style={{
                        bottom: 3 * scale,
                        left: 3 * scale,
                        width: 4.5 * scale,
                        height: 4.5 * scale
                      }}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT SPARKLING ANIME EYE */}
              <div className="relative flex items-center justify-center">
                {isBlinking ? (
                  /* Happy Crescent Smile Blink: ^ */
                  <div
                    className="border-b-[3px] border-cyan-300 rounded-full"
                    style={{ width: 22 * scale, height: 10 * scale }}
                  />
                ) : (
                  /* Big Shiny Anime Eye with Catchlight Stars */
                  <div
                    className="rounded-full bg-gradient-to-b from-cyan-300 via-cyan-400 to-sky-500 flex items-center justify-center relative shadow-[0_0_14px_#00dfd8] transition-transform duration-200"
                    style={{
                      width: 22 * scale,
                      height: 24 * scale,
                      transform: state === 'speaking' ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    {/* Big white catchlight circle */}
                    <div
                      className="absolute rounded-full bg-white shadow-sm"
                      style={{
                        top: 2.5 * scale,
                        right: 2.5 * scale,
                        width: 9 * scale,
                        height: 9 * scale
                      }}
                    />
                    {/* Small twinkle catchlight */}
                    <div
                      className="absolute rounded-full bg-white/90"
                      style={{
                        bottom: 3 * scale,
                        left: 3 * scale,
                        width: 4.5 * scale,
                        height: 4.5 * scale
                      }}
                    />
                  </div>
                )}
              </div>

              {/* GLOWING ROSY BLUSH CHEEKS (গালের মিষ্টি পিংক ব্লাশ) */}
              <div
                className="absolute rounded-full bg-pink-400/85 blur-[0.4px] shadow-[0_0_10px_#ff6b9d]"
                style={{
                  bottom: 11 * scale,
                  left: 10 * scale,
                  width: 14 * scale,
                  height: 7 * scale
                }}
              />
              <div
                className="absolute rounded-full bg-pink-400/85 blur-[0.4px] shadow-[0_0_10px_#ff6b9d]"
                style={{
                  bottom: 11 * scale,
                  right: 10 * scale,
                  width: 14 * scale,
                  height: 7 * scale
                }}
              />

              {/* SWEET SMILING MOUTH (◡) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full border-b-[2.5px] border-cyan-300 transition-all duration-150 shadow-[0_0_8px_#00dfd8]"
                style={{
                  bottom: 9 * scale,
                  width: mouthWidth * scale,
                  height: mouthHeight * scale,
                  backgroundColor: state === 'speaking' ? '#00dfd8' : 'transparent'
                }}
              />
            </div>
          </div>

          {/* Right Headphone Ear */}
          <div
            className="rounded-full bg-gradient-to-l from-sky-400 to-cyan-300 shadow-md border-2 border-white -ml-2.5 z-0"
            style={{
              width: 26 * scale,
              height: 38 * scale,
              boxShadow: '0 0 12px rgba(0, 223, 216, 0.5)'
            }}
          />
        </div>

        {/* 3. Chubby Torso with Love Heart Reactor & Waving Arms */}
        <div className="relative flex items-center justify-center -mt-2 z-10">
          
          {/* Left Chubby Baby Arm */}
          <div
            className="rounded-full bg-white border border-sky-200 shadow-md -mr-2.5 rotate-12"
            style={{ width: 14 * scale, height: 28 * scale }}
          />

          {/* Chubby White Torso with Glowing Heart (❤️) */}
          <div
            className="rounded-3xl p-1.5 flex items-center justify-center border-2 border-sky-100 bg-gradient-to-b from-white via-sky-50 to-white shadow-lg relative"
            style={{
              width: 96 * scale,
              height: 66 * scale,
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.2)'
            }}
          >
            {/* Glowing Heart Reactor Core */}
            <div
              className="rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 animate-pulse flex items-center justify-center shadow-[0_0_16px_#ff2a85]"
              style={{
                width: 26 * scale,
                height: 26 * scale
              }}
            >
              <span style={{ fontSize: 13 * scale }}>❤️</span>
            </div>
          </div>

          {/* Right Baby Arm (Waving Hello! 👋) */}
          <div
            className="rounded-full bg-white border border-sky-200 shadow-md -ml-2.5 -rotate-45 origin-top animate-pulse"
            style={{ width: 14 * scale, height: 28 * scale }}
          />
        </div>

        {/* 4. Cute Dangling Baby Booties / Shoes (মিষ্টি ছোট্ট জুতো) */}
        <div className="flex gap-4 -mt-1.5 z-0">
          <div
            className="rounded-full bg-gradient-to-b from-sky-300 to-cyan-400 border border-white shadow-md animate-bounce"
            style={{
              width: 20 * scale,
              height: 14 * scale,
              boxShadow: '0 4px 10px rgba(56, 189, 248, 0.4)'
            }}
          />
          <div
            className="rounded-full bg-gradient-to-b from-sky-300 to-cyan-400 border border-white shadow-md animate-bounce"
            style={{
              width: 20 * scale,
              height: 14 * scale,
              boxShadow: '0 4px 10px rgba(56, 189, 248, 0.4)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
