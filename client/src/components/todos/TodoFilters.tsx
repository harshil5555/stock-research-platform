import Select from '@/components/ui/Select';

interface TodoFiltersProps {
  status: string;
  priority: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
}

export default function TodoFilters({ status, priority, onStatusChange, onPriorityChange }: TodoFiltersProps) {
  return (
    <div className="flex gap-3">
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { value: '', label: 'All Statuses' },
          { value: 'todo', label: 'Todo' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'done', label: 'Done' },
        ]}
      />
      <Select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        options={[
          { value: '', label: 'All Priorities' },
          { value: 'immediate', label: 'Immediate' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ]}
      />
    </div>
  );
}
