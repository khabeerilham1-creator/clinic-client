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
    const frequency = type === "success" ? 740 : type === "warning" ? 420 : 560;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.16);
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
