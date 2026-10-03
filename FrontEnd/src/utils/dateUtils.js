export function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getSixMonthsAgo() {
  const currentDate = new Date()
  const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1)
  const lastDayOfTargetMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
  targetMonth.setDate(Math.min(currentDate.getDate(), lastDayOfTargetMonth))
  return toDateInputValue(targetMonth)
}

export function formatServiceDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function playRequestAlertTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  let audioContext
  try { audioContext = new AudioContextClass() } catch { return }
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

