export const COLOR_OPTIONS = [
  'blue', 'indigo', 'purple', 'cyan', 'emerald', 'teal', 'amber', 'orange', 'rose', 'gray',
] as const

export type ColorSlug = typeof COLOR_OPTIONS[number]

export const colorBadge: Record<string, string> = {
  blue:    'border-blue-200 bg-blue-50 text-blue-700',
  indigo:  'border-indigo-200 bg-indigo-50 text-indigo-700',
  purple:  'border-purple-200 bg-purple-50 text-purple-700',
  cyan:    'border-cyan-200 bg-cyan-50 text-cyan-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  teal:    'border-teal-200 bg-teal-50 text-teal-700',
  amber:   'border-amber-200 bg-amber-50 text-amber-700',
  orange:  'border-orange-200 bg-orange-50 text-orange-700',
  rose:    'border-rose-200 bg-rose-50 text-rose-700',
  gray:    'border-gray-200 bg-gray-50 text-gray-600',
}

export const colorBg: Record<string, string> = {
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  purple:  'bg-purple-500',
  cyan:    'bg-cyan-500',
  emerald: 'bg-emerald-500',
  teal:    'bg-teal-500',
  amber:   'bg-amber-400',
  orange:  'bg-orange-500',
  rose:    'bg-rose-500',
  gray:    'bg-gray-400',
}

export const colorDot: Record<string, string> = {
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  purple:  'bg-purple-500',
  cyan:    'bg-cyan-400',
  emerald: 'bg-emerald-500',
  teal:    'bg-teal-500',
  amber:   'bg-amber-400',
  orange:  'bg-orange-500',
  rose:    'bg-rose-500',
  gray:    'bg-gray-400',
}
