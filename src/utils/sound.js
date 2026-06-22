let enabled = true;

export const isSoundEnabled = () => enabled;

export const setSoundEnabled = (value) => {
  enabled = Boolean(value);
};

export const playSectionSound = (type = "section") => {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const frequency = type === "success" ? 740 : type === "warning" ? 420 : 560;

    oscillator.type = type === "warning" ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.42, ctx.currentTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(18, ctx.currentTime);
    compressor.ratio.setValueAtTime(8, ctx.currentTime);
    oscillator.connect(gain);
    gain.connect(compressor);
    compressor.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.34);
    oscillator.onended = () => ctx.close();
  } catch (error) {
    // Browser audio can be blocked before a user gesture; section sounds are optional.
  }
};

export const announceRestockAlert = (productName = "Inventory item") => {
  playSectionSound("warning");

  if (typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(
      `${productName} needs to restock before stockout.`
    );
    message.rate = 0.95;
    message.volume = 1;
    window.speechSynthesis.speak(message);
  } catch (error) {
    // Spoken alerts are optional; the warning tone and on-screen alert still work.
  }
};
