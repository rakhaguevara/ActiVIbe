import { ORGANIZER_DECLARATION_ITEMS, type DeclarationKey } from '../../lib/organizerDeclarationItems'
import './OrganizerDeclarationChecklist.css'

interface OrganizerDeclarationChecklistProps {
  values: Record<DeclarationKey, boolean>
  onChange: (key: DeclarationKey, value: boolean) => void
}

export default function OrganizerDeclarationChecklist({ values, onChange }: OrganizerDeclarationChecklistProps) {
  return (
    <div className="organizer-declaration-checklist">
      {ORGANIZER_DECLARATION_ITEMS.map((item) => (
        <label key={item.key} className="organizer-declaration-checklist__item">
          <input type="checkbox" checked={values[item.key]} onChange={(e) => onChange(item.key, e.target.checked)} />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  )
}
