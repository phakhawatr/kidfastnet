import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation('exercises')
  
  const isDark = theme === 'dark'
  
  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
      <Sun className="w-4 h-4 text-amber-500" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label={t('themeToggle.toggle', { defaultValue: 'Toggle theme' })}
      />
      <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      <Label className="text-xs font-medium cursor-pointer ml-1">
        {isDark ? t('themeToggle.dark', { defaultValue: 'มืด' }) : t('themeToggle.light', { defaultValue: 'สว่าง' })}
      </Label>
    </div>
  )
}
