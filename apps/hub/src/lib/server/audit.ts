import { prisma } from '@saltcollective/schema';
import type { AuditEntityType, AuditEventType } from '@saltcollective/schema';
import { withSpan, recordError } from '$lib/server/telemetry';

export interface AuditActor {
  id: string;
  email: string;
}

// Append-only lifecycle log. A failed audit write must never break the action
// it records — log and continue.
export async function logAudit(opts: {
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  type: AuditEventType;
  actor?: AuditActor | null;
  detail?: string;
}) {
  await withSpan(
    'audit.log',
    {
      'app.audit.entityType': opts.entityType,
      'app.audit.type': opts.type,
      'app.audit.entityId': opts.entityId,
    },
    async (span) => {
      try {
        await prisma.auditEvent.create({
          data: {
            entityType: opts.entityType,
            entityId: opts.entityId,
            entityName: opts.entityName,
            type: opts.type,
            actorId: opts.actor?.id ?? null,
            actorEmail: opts.actor?.email ?? null,
            detail: opts.detail ?? null,
          },
        });
      } catch (e) {
        // Swallowed by design — the span's ERROR status is what surfaces it.
        recordError(span, e);
        console.error('logAudit failed:', e);
      }
    },
  );
}
