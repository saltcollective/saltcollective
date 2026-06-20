import type { BusinessStatus } from '@saltcollective/schema';

// Human-readable label for each Business status.
export const STATUS_LABEL: Record<BusinessStatus, string> = {
  LEAD: 'Lead',
  ACTIVE: 'Active',
  DECLINED: 'Declined',
  ARCHIVED: 'Archived',
};

// Maps a Business status to a Badge variant.
export const STATUS_VARIANT: Record<
  BusinessStatus,
  'default' | 'success' | 'warning' | 'destructive'
> = {
  LEAD: 'warning',
  ACTIVE: 'success',
  DECLINED: 'destructive',
  ARCHIVED: 'default',
};
