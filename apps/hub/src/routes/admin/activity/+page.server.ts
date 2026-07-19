import { prisma } from '@saltcollective/schema';
import type { AuditEntityType, AuditEventType, Prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 50;

const ENTITY_TYPES = new Set(['CLUB', 'USER']);
const EVENT_TYPES = new Set([
  'CLUB_CREATED',
  'CLUB_PUBLISHED',
  'CLUB_SUSPENDED',
  'CLUB_REACTIVATED',
  'CLUB_DELETED',
  'USER_CREATED',
  'USER_DEACTIVATED',
  'USER_REACTIVATED',
  'USER_DELETED',
  'USER_TYPE_CHANGED',
  'MEMBER_JOINED',
  'MEMBER_REMOVED',
  'MEMBER_ROLE_CHANGED',
]);

export const load: PageServerLoad = async ({ url }) => {
  const rawEntity = url.searchParams.get('entity') ?? '';
  const rawType = url.searchParams.get('type') ?? '';
  const q = (url.searchParams.get('q') ?? '').trim();
  const id = (url.searchParams.get('id') ?? '').trim();
  const from = url.searchParams.get('from') ?? '';
  const to = url.searchParams.get('to') ?? '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);

  const entity = ENTITY_TYPES.has(rawEntity) ? (rawEntity as AuditEntityType) : null;
  const type = EVENT_TYPES.has(rawType) ? (rawType as AuditEventType) : null;

  const where: Prisma.AuditEventWhereInput = {};
  if (entity) where.entityType = entity;
  if (type) where.type = type;
  if (id) where.entityId = id;
  if (q) {
    where.OR = [
      { entityName: { contains: q, mode: 'insensitive' } },
      { actorEmail: { contains: q, mode: 'insensitive' } },
    ];
  }
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;
  if (fromDate && !isNaN(fromDate.getTime())) {
    where.createdAt = { ...(where.createdAt as object), gte: fromDate };
  }
  if (toDate && !isNaN(toDate.getTime())) {
    // Include the whole "to" day.
    const end = new Date(toDate);
    end.setDate(end.getDate() + 1);
    where.createdAt = { ...(where.createdAt as object), lt: end };
  }

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        entityName: true,
        type: true,
        actorEmail: true,
        detail: true,
        createdAt: true,
      },
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    pageSize: PAGE_SIZE,
    filters: { entity: entity ?? '', type: type ?? '', q, id, from, to },
  };
};
