import Badge from '@/components/ui/Badge';
import { decisionColors } from '@/lib/utils';

interface DecisionBadgeProps {
  decision: string;
  className?: string;
}

export default function DecisionBadge({ decision, className }: DecisionBadgeProps) {
  return (
    <Badge variant={decisionColors[decision] || decisionColors.none} className={className}>
      {decision.toUpperCase()}
    </Badge>
  );
}
