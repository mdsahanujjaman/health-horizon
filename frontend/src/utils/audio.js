/**
 * Ultra-premium synthesized sound effects using the Web Audio API.
 * Requires no static file assets, performs instantly, and works 100% locally.
 */

const getAudioContext = () => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

// Satisfying interface click/tick
export const playTapSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

// Premium fintech cash-register billing arpeggio ("Ka-Ching!" coin bell drop)
export const playPaymentSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Layer 1: Rapid metallic striker sound ("ka")
    const striker1 = ctx.createOscillator();
    const striker2 = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    
    striker1.connect(strikeGain);
    striker2.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    
    striker1.type = 'triangle';
    striker1.frequency.setValueAtTime(3200, now);
    
    striker2.type = 'sine';
    striker2.frequency.setValueAtTime(4500, now);
    
    strikeGain.gain.setValueAtTime(0.08, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    striker1.start(now);
    striker2.start(now);
    striker1.stop(now + 0.05);
    striker2.stop(now + 0.05);
    
    // Layer 2: Glorious ringing metallic bell chord (E5, G#5, B5, E6)
    const bellNotes = [659.25, 830.61, 987.77, 1318.51];
    
    bellNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.02);
      
      gain.gain.setValueAtTime(0, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02 + 0.85);
      
      osc.start(now + 0.02);
      osc.stop(now + 0.02 + 0.85);
    });
  } catch (e) {}
};

// Warm major arpeggio for bookings
export const playAppointmentConfirmedSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [587.33, 783.99, 1174.66]; // D5 - G5 - D6 arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);
      
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  } catch (e) {}
};

// Quick bubble pop for reminder creations
export const playReminderCreatedSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5 rising to E6
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {}
};

// Descending digital sweep filter pop for deletions
export const playDeleteSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {}
};

// Beautiful warm rising arpeggio chord welcoming user (C4 - E4 - G4 - B4 - C5)
export const playLoginWelcomeSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 493.88, 523.25];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.55);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.55);
    });
  } catch (e) {}
};
