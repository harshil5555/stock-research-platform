import Badge from '@/components/ui/Badge';
import { decisionStatusColors } from '@/lib/utils';

interface DecisionBadgeProps {
  status: string;
  className?: string;
}

export default function DecisionBadge({ status, className }: DecisionBadgeProps) {
  return (
    <Badge variant={decisionStatusColors[status] || decisionStatusColors.researching} className={className}>
      {status.toUpperCase()}
    </Badge>
  );
}
