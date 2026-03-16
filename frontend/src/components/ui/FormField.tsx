interface FormFieldProps {
  label: string
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  textarea?: boolean
}

export default function FormField({ label, name, value, onChange, type = "text", required, placeholder, options, textarea }: FormFieldProps) {
  const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select name={name} value={value} onChange={onChange} className={baseClass} required={required}>
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : textarea ? (
        <textarea name={name} value={value} onChange={onChange as any} className={baseClass + " h-20"}
          required={required} placeholder={placeholder} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className={baseClass}
          required={required} placeholder={placeholder} />
      )}
    </div>
  )
}
