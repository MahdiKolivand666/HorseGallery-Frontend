const VideoSection = () => {
  return (
    <section className="w-full overflow-hidden">
      {/* Video Player - Full Width */}
      <div className="relative w-full">
        <video
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
