import Select from '@/components/ui/Select';

interface TodoFiltersProps {
  status: string;
  onStatusChange: (v: string) => void;
}

export default function TodoFilters({ status, onStatusChange }: TodoFiltersProps) {
  return (
    <div className="flex gap-3">
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { value: '', label: 'All Statuses' },
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'done', label: 'Done' },
        ]}
      />
    </div>
  );
}
