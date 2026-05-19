import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 1800, delay = 0) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const timeout = setTimeout(() => {
      const start = performance.now()
      const animate = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.floor(eased * target))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setValue(target)
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }, delay)
    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return value
}
