(() => {
  "use strict";

  const app = document.getElementById("app");
  const screensRoot = document.getElementById("screens");
  const screens = Array.from(document.querySelectorAll(".screen"));
  const indicators = Array.from(document.querySelectorAll("#pageIndicator span"));
  const preloader = document.getElementById("preloader");
  const loaderBar = document.getElementById("loaderBar");
  const loaderValue = document.getElementById("loaderValue");
  const startButton = document.getElementById("startButton");
  const musicToggle = document.getElementById("musicToggle");
  const musicLabel = musicToggle.querySelector(".music-label");
  const musicIcon = musicToggle.querySelector(".music-icon");
  const bgm = document.getElementById("bgm");
  const toast = document.getElementById("toast");
  const confetti = document.getElementById("confetti");
  const shareButton = document.getElementById("shareButton");
  const shareGuide = document.getElementById("shareGuide");
  const shareGuideClose = document.getElementById("shareGuideClose");
  const copyShareNote = document.getElementById("copyShareNote");

  const SHARE_URL = "https://yyu521053-ship-it.github.io/wedding-2026-09-16/";
  const SHARE_TITLE = "于清旭 & 成冰冰的婚礼邀请";
  const SHARE_TEXT = "2026年9月16日，诚邀您见证我们的婚礼";
  const SHARE_NOTE_TEXT = `${SHARE_TITLE}\n${SHARE_TEXT}\n\n打开完整婚礼邀请函：\n${SHARE_URL}`;

  let currentScreen = 0;
  let audioUnlocked = false;
  let touchStart = null;
  let wheelLocked = false;
  let toastTimer = null;
  let shareReturnFocus = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function showToast(message, duration = 2400) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), duration);
  }

  function normalizeShareUrl() {
    const canonical = new URL(SHARE_URL);
    const isCanonicalPage = window.location.origin === canonical.origin && window.location.pathname === canonical.pathname;
    if (isCanonicalPage && (window.location.search || window.location.hash)) {
      window.history.replaceState(null, document.title, SHARE_URL);
    }
  }

  function openShareGuide() {
    shareReturnFocus = document.activeElement;
    shareGuide.classList.add("is-visible");
    shareGuide.setAttribute("aria-hidden", "false");
    window.setTimeout(() => shareGuideClose.focus(), 80);
  }

  function closeShareGuide() {
    shareGuide.classList.remove("is-visible");
    shareGuide.setAttribute("aria-hidden", "true");
    if (shareReturnFocus instanceof HTMLElement) shareReturnFocus.focus();
  }

  function copyWithSelection(text) {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }

  async function copyShareNoteText() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(SHARE_NOTE_TEXT);
      } else if (!copyWithSelection(SHARE_NOTE_TEXT)) {
        throw new Error("copy command failed");
      }
      showToast("微信邀请文案已复制", 1800);
      return true;
    } catch (error) {
      showToast("复制失败，请长按选中文案复制", 2600);
      return false;
    }
  }

  function shareInvitation() {
    openShareGuide();
  }

  function setMusicUI(playing) {
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "暂停音乐" : "播放音乐");
    musicLabel.textContent = playing ? "播放中" : "音乐";
    musicIcon.textContent = playing ? "♪" : "♫";
  }

  async function playMusic({ quiet = false } = {}) {
    try {
      bgm.volume = 0.62;
      await bgm.play();
      audioUnlocked = true;
      setMusicUI(true);
      if (!quiet) showToast("音乐已开启 ♪", 1500);
      return true;
    } catch (error) {
      setMusicUI(false);
      if (!quiet) showToast("音乐未能播放，点击右上角可再次尝试");
      return false;
    }
  }

  function pauseMusic() {
    bgm.pause();
    setMusicUI(false);
    showToast("音乐已暂停", 1400);
  }

  function goToScreen(index) {
    const next = clamp(Number(index), 0, screens.length - 1);
    if (next === currentScreen) return;

    currentScreen = next;
    screens.forEach((screen, screenIndex) => {
      const active = screenIndex === next;
      screen.classList.toggle("is-active", active);
      screen.classList.toggle("is-before", screenIndex < next);
      screen.setAttribute("aria-hidden", String(!active));
      if (active) screen.scrollTop = 0;
    });
    indicators.forEach((indicator, indicatorIndex) => {
      indicator.classList.toggle("is-current", indicatorIndex === next);
    });
  }

  function addAmbientParticles() {
    const palettes = ["#f2bf5c", "#ffe5a5", "#d64c4f", "#fff1ca"];
    document.querySelectorAll(".particles").forEach((container, containerIndex) => {
      const count = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 4 : 22;
      for (let index = 0; index < count; index += 1) {
        const particle = document.createElement("i");
        particle.className = "particle";
        particle.style.left = `${(index * 37 + containerIndex * 11) % 100}%`;
        particle.style.setProperty("--size", `${3 + (index % 5)}px`);
        particle.style.setProperty("--duration", `${7.5 + (index % 7) * 0.72}s`);
        particle.style.setProperty("--delay", `${-((index * 0.63) % 8)}s`);
        particle.style.setProperty("--drift", `${-28 + ((index * 17) % 56)}px`);
        particle.style.setProperty("--color", palettes[index % palettes.length]);
        container.appendChild(particle);
      }
    });
  }

  function celebrate() {
    confetti.replaceChildren();
    const colors = ["#f2bf5c", "#ffe5a5", "#d83f50", "#fff7df", "#8e2132"];
    for (let index = 0; index < 58; index += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti-piece";
      piece.style.left = `${(index * 29) % 100}%`;
      piece.style.setProperty("--duration", `${2.2 + (index % 7) * 0.18}s`);
      piece.style.setProperty("--delay", `${(index % 12) * 0.035}s`);
      piece.style.setProperty("--drift", `${-70 + ((index * 23) % 140)}px`);
      piece.style.setProperty("--spin", `${180 + (index % 6) * 90}deg`);
      piece.style.setProperty("--color", colors[index % colors.length]);
      confetti.appendChild(piece);
    }
    showToast("赴约成功！期待与您相见 ✦", 2800);
  }

  function bindControls() {
    startButton.addEventListener("click", async () => {
      startButton.classList.add("is-pressed");
      await playMusic({ quiet: true });
      window.setTimeout(() => {
        startButton.classList.remove("is-pressed");
        goToScreen(1);
      }, 150);
    });

    musicToggle.addEventListener("click", () => {
      if (bgm.paused) playMusic();
      else pauseMusic();
    });

    shareButton.addEventListener("click", shareInvitation);
    copyShareNote.addEventListener("click", copyShareNoteText);
    shareGuide.querySelectorAll("[data-share-close]").forEach((button) => {
      button.addEventListener("click", closeShareGuide);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && shareGuide.classList.contains("is-visible")) closeShareGuide();
    });

    document.querySelectorAll("[data-next]").forEach((button) => {
      button.addEventListener("click", () => goToScreen(button.dataset.next));
    });

    document.querySelectorAll("[data-back]").forEach((button) => {
      button.addEventListener("click", () => goToScreen(button.dataset.back));
    });

    document.querySelectorAll("[data-attend]").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.add("is-pressed");
        celebrate();
        window.setTimeout(() => button.classList.remove("is-pressed"), 360);
      });
    });

    bgm.addEventListener("play", () => setMusicUI(true));
    bgm.addEventListener("pause", () => setMusicUI(false));
    bgm.addEventListener("error", () => {
      setMusicUI(false);
      if (audioUnlocked) showToast("音乐加载失败，可继续浏览请帖");
    });
  }

  function bindGestures() {
    screensRoot.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        touchStart = { x: touch.clientX, y: touch.clientY, target: event.target };
      },
      { passive: true },
    );

    screensRoot.addEventListener(
      "touchend",
      (event) => {
        if (!touchStart) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        const startedOnControl = touchStart.target.closest("button, a");
        touchStart = null;
        if (startedOnControl || Math.abs(deltaY) < 58 || Math.abs(deltaY) < Math.abs(deltaX) * 1.25) return;
        if (deltaY < 0) goToScreen(currentScreen + 1);
        else goToScreen(currentScreen - 1);
      },
      { passive: true },
    );

    window.addEventListener(
      "wheel",
      (event) => {
        if (wheelLocked || Math.abs(event.deltaY) < 40) return;
        wheelLocked = true;
        goToScreen(currentScreen + (event.deltaY > 0 ? 1 : -1));
        window.setTimeout(() => {
          wheelLocked = false;
        }, 700);
      },
      { passive: true },
    );

    window.addEventListener("keydown", (event) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goToScreen(currentScreen + 1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goToScreen(currentScreen - 1);
      }
      if (event.key === "Home") goToScreen(0);
      if (event.key === "End") goToScreen(screens.length - 1);
    });
  }

  async function preload() {
    const sources = ["assets/images/stage.webp", "assets/images/couple.webp", "assets/images/cat.webp"];
    let completed = 0;
    const update = () => {
      const percent = Math.round((completed / sources.length) * 100);
      loaderBar.style.width = `${percent}%`;
      loaderValue.textContent = `${percent}%`;
    };

    const jobs = sources.map(
      (source) =>
        new Promise((resolve) => {
          const image = new Image();
          const finish = () => {
            completed += 1;
            update();
            resolve();
          };
          image.onload = finish;
          image.onerror = finish;
          image.src = source;
        }),
    );

    update();
    await Promise.allSettled(jobs);
    window.setTimeout(() => {
      preloader.classList.add("is-hidden");
      app.setAttribute("aria-busy", "false");
    }, 280);
  }

  normalizeShareUrl();
  addAmbientParticles();
  bindControls();
  bindGestures();
  preload();
})();
