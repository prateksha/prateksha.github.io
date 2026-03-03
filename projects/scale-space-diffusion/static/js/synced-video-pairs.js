function initSyncedVideoPair(config) {
  const videoA = document.getElementById(config.videoAId);
  const videoB = document.getElementById(config.videoBId);
  const toggleBtn = document.getElementById(config.toggleId);
  const slider = document.getElementById(config.sliderId);
  const hasSlider = !!slider;

  if (!videoA || !videoB || !toggleBtn) return;

  let isSeeking = false;
  let maxDuration = 0;

  const updateToggle = () => {
    const isPaused = videoA.paused || videoB.paused;
    toggleBtn.textContent = isPaused ? "▶ Play" : "⏸ Pause";
    toggleBtn.setAttribute("aria-label", isPaused ? "Play both videos" : "Pause both videos");
  };

  const updateDuration = () => {
    const a = Number.isFinite(videoA.duration) ? videoA.duration : 0;
    const b = Number.isFinite(videoB.duration) ? videoB.duration : 0;
    maxDuration = Math.min(a, b);
    if (hasSlider && maxDuration > 0) slider.max = String(Math.floor(maxDuration * 1000));
  };

  const playBoth = async () => {
    try {
      await Promise.all([videoA.play(), videoB.play()]);
    } catch (_) {
      // Ignore autoplay/play promise failures caused by browser policy.
    }
    updateToggle();
  };

  const pauseBoth = () => {
    videoA.pause();
    videoB.pause();
    updateToggle();
  };

  const syncSliderFromVideos = () => {
    if (!hasSlider || isSeeking || maxDuration <= 0) return;
    const t = Math.min(videoA.currentTime, videoB.currentTime, maxDuration);
    slider.value = String(Math.floor(t * 1000));
  };

  const seekBoth = () => {
    if (!hasSlider) return;
    if (maxDuration <= 0) return;
    const t = Math.min(Number(slider.value) / 1000, maxDuration);
    isSeeking = true;
    videoA.currentTime = t;
    videoB.currentTime = t;
    isSeeking = false;
  };

  toggleBtn.addEventListener("click", async () => {
    if (videoA.paused || videoB.paused) {
      await playBoth();
      return;
    }
    pauseBoth();
  });

  if (hasSlider) {
    slider.addEventListener("pointerdown", pauseBoth);
    slider.addEventListener("input", seekBoth);
  }

  videoA.addEventListener("loadedmetadata", updateDuration);
  videoB.addEventListener("loadedmetadata", updateDuration);
  videoA.addEventListener("timeupdate", syncSliderFromVideos);
  videoB.addEventListener("timeupdate", syncSliderFromVideos);
  videoA.addEventListener("play", updateToggle);
  videoB.addEventListener("play", updateToggle);
  videoA.addEventListener("pause", updateToggle);
  videoB.addEventListener("pause", updateToggle);

  Promise.all([
    new Promise((resolve) => {
      if (videoA.readyState >= 1) resolve();
      else videoA.addEventListener("loadeddata", resolve, { once: true });
    }),
    new Promise((resolve) => {
      if (videoB.readyState >= 1) resolve();
      else videoB.addEventListener("loadeddata", resolve, { once: true });
    }),
  ]).then(async () => {
    updateDuration();
    videoA.currentTime = 0;
    videoB.currentTime = 0;
    await playBoth();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSyncedVideoPair({
    videoAId: "compareVid1",
    videoBId: "compareVid2",
    toggleId: "compareToggle",
    sliderId: "compareSlider",
  });

  initSyncedVideoPair({
    videoAId: "stackVid1",
    videoBId: "stackVid2",
    toggleId: "stackToggle",
    sliderId: "stackSlider",
  });
});
