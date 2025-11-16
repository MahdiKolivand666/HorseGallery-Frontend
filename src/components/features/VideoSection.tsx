"use client";

import { useEffect, useRef } from "react";

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto play when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <section className="w-full overflow-hidden">
      {/* Video Player - Full Width */}
      <div className="relative w-full">
        <video
          ref={videoRef}
          className="w-full h-auto object-cover"
          loop
          muted
          autoPlay
          playsInline
        >
          <source src="/video/video1.mp4" type="video/mp4" />
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>
    </section>
  );
};

export default VideoSection;
