function initVideoToggle(config) {
  const video = document.getElementById(config.videoId);
  const toggleBtn = document.getElementById(config.toggleId);
  if (!video || !toggleBtn) return;

  const updateToggle = () => {
    const isPaused = video.paused;
    toggleBtn.textContent = isPaused ? "▶ Play" : "⏸ Pause";
    toggleBtn.setAttribute("aria-label", isPaused ? "Play video" : "Pause video");
  };

  const playVideo = async () => {
    try {
      await video.play();
    } catch (_) {
      // Allow manual playback if autoplay is blocked.
      video.controls = true;
    }
    updateToggle();
  };

  const pauseVideo = () => {
    video.pause();
    updateToggle();
  };

  toggleBtn.addEventListener("click", async () => {
    if (video.paused) {
      await playVideo();
      return;
    }
    pauseVideo();
  });

  video.addEventListener("play", updateToggle);
  video.addEventListener("pause", updateToggle);

  if (video.readyState === 0) video.load();
  playVideo();
}

document.addEventListener("DOMContentLoaded", () => {
  initVideoToggle({
    videoId: "stackVid1",
    toggleId: "stackToggle",
  });
});
