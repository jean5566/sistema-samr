import { useState, useEffect, useRef } from 'react'

interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  buttonClassName?: string;
  allowEmpty?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder, buttonClassName, allowEmpty = true }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('click', handler);
    }
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${buttonClassName?.includes('w-full') ? 'w-full' : ''}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`${buttonClassName || ''} flex items-center justify-between gap-2`}>
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full min-w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {allowEmpty && (
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === '' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
              {placeholder}
            </button>
          )}
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === opt.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
