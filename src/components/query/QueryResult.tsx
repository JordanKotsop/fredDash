'use client';

import type { QueryInterpretation } from '@/lib/ai/types';
import { ChartConversation } from '@/components/conversation';

interface QueryResultProps {
  interpretation: QueryInterpretation;
  onFollowUp: (query: string) => void;
}

export function QueryResult({ interpretation, onFollowUp }: QueryResultProps) {
  return (
    <ChartConversation
      interpretation={interpretation}
      onFollowUp={onFollowUp}
    />
  );
}
