import React, { useEffect, useState } from "react";

export default function Eyes() {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const deltaX = mouseX - window.innerWidth / 2;
      const deltaY = mouseY - window.innerHeight / 2;

      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      setRotate(angle);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="eyes w-full h-screen overflow-hidden flex justify-center items-center bg-[url('./assets/img.jpg')] bg-cover bg-center">
      {/* Eye Container */}
      <div className="flex gap-20">
        {/* Left Eye */}
        <div className="flex items-center justify-center w-[12vw] h-[12vw] rounded-full bg-zinc-300">
          <div className="relative w-2/3 h-2/3 rounded-full bg-zinc-900">
            <div
              className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-zinc-100"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotate}deg) translateX(29px)`,
              }}
            ></div>
          </div>
        </div>

        {/* Right Eye */}
        <div className="flex items-center justify-center w-[12vw] h-[12vw] rounded-full bg-zinc-300">
          <div className="relative w-2/3 h-2/3 rounded-full bg-zinc-900">
            <div
              className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-zinc-100"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotate}deg) translateX(20px)`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
