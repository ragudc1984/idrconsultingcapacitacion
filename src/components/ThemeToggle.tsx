import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      // Sin aria-pressed: la etiqueta ya dice que pasara al activarlo, y
      // "presionado" no significa nada util sobre un tema.
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="focus-ring-violet touch-target no-print mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:text-[var(--violet)] hover:shadow-[0_0_14px_var(--violet-glow)]"
    >
      {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}

export default ThemeToggle
