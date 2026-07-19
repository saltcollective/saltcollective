export const EVENT_LABELS: Record<string, string> = {
  CLUB_CREATED: 'Club created',
  CLUB_PUBLISHED: 'Club published',
  CLUB_SUSPENDED: 'Club suspended',
  CLUB_REACTIVATED: 'Club reactivated',
  CLUB_DELETED: 'Club deleted',
  USER_CREATED: 'User signed up',
  USER_DEACTIVATED: 'User deactivated',
  USER_REACTIVATED: 'User reactivated',
  USER_DELETED: 'User deleted',
  USER_TYPE_CHANGED: 'Platform role changed',
  MEMBER_JOINED: 'Member joined',
  MEMBER_REMOVED: 'Member removed',
  MEMBER_ROLE_CHANGED: 'Member role changed',
};

export function fmtTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}
