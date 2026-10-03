export function playRequestAlertTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  let audioContext
  try {
    audioContext = new AudioContextClass()
  } catch {
    return
  }

  const startAt = audioContext.currentTime
  ;[0, 0.3, 0.6].forEach((offset, index) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const toneStart = startAt + offset
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, toneStart)
    gain.gain.exponentialRampToValueAtTime(0.12, toneStart + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + 0.18)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(toneStart)
    oscillator.stop(toneStart + 0.19)
    if (index === 2) oscillator.onended = () => audioContext.close()
  })
}
