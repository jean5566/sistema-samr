interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-6 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}>
      <span className={`pointer-events-none block h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white'}`} />
    </button>
  )
}
