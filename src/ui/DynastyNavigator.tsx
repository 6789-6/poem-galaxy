import type { DynastyId } from '../data/schema';

const DYNASTIES: Array<{ id: DynastyId; label: string }> = [
  { id: 'pre-qin', label: '先秦' },
  { id: 'han-wei', label: '汉魏六朝' },
  { id: 'tang', label: '唐' },
  { id: 'song', label: '宋' },
  { id: 'yuan-ming-qing', label: '元明清' },
  { id: 'modern', label: '近现代' }
];

export interface DynastyNavigatorProps {
  activeDynasties: DynastyId[];
  onChange: (dynasties: DynastyId[]) => void;
}

export function DynastyNavigator({ activeDynasties, onChange }: DynastyNavigatorProps) {
  const toggle = (dynasty: DynastyId) => {
    const next = activeDynasties.includes(dynasty)
      ? activeDynasties.filter((candidate) => candidate !== dynasty)
      : [...activeDynasties, dynasty];
    if (next.length > 0) onChange(next);
  };

  return (
    <fieldset className="dynasty-navigator">
      <legend>朝代星环</legend>
      {DYNASTIES.map(({ id, label }) => (
        <label key={id}>
          <input
            type="checkbox"
            checked={activeDynasties.includes(id)}
            onChange={() => toggle(id)}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
