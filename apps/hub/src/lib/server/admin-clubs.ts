import { prisma } from '@saltcollective/schema';
import { logAudit, type AuditActor } from '$lib/server/audit';

type OpResult = { ok: true } | { ok?: never; error: string };

export async function setClubStatus(
  clubId: string,
  status: 'ACTIVE' | 'SUSPENDED',
  actor: AuditActor,
): Promise<OpResult> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  });
  if (!club) return { error: 'Club not found' };

  await prisma.club.update({
    where: { id: clubId },
    data:
      status === 'SUSPENDED'
        ? { status, suspendedAt: new Date() }
        : { status, suspendedAt: null },
  });
  await logAudit({
    entityType: 'CLUB',
    entityId: clubId,
    entityName: club.name,
    type: status === 'SUSPENDED' ? 'CLUB_SUSPENDED' : 'CLUB_REACTIVATED',
    actor,
  });

  return { ok: true };
}

export async function deleteClub(clubId: string, actor: AuditActor): Promise<OpResult> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  });
  if (!club) return { error: 'Club not found' };

  // No onDelete cascades in the schema — remove dependents in FK order.
  // Implicit business↔tag join rows cascade with the businesses/tags themselves.
  await prisma.$transaction([
    prisma.clickEvent.deleteMany({ where: { clubId } }),
    prisma.clubInvite.deleteMany({ where: { clubId } }),
    prisma.clubMembership.deleteMany({ where: { clubId } }),
    prisma.business.deleteMany({ where: { clubId } }),
    prisma.sponsorTier.deleteMany({ where: { clubId } }),
    prisma.tag.deleteMany({ where: { clubId } }),
    prisma.discountCode.updateMany({
      where: { redeemedByClubId: clubId },
      data: { redeemedByClubId: null },
    }),
    prisma.club.delete({ where: { id: clubId } }),
  ]);

  await logAudit({
    entityType: 'CLUB',
    entityId: clubId,
    entityName: club.name,
    type: 'CLUB_DELETED',
    actor,
  });

  return { ok: true };
}
