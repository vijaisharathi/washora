import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateImprovementDto, UpdateImprovementDto, ImprovementStatus } from '../dto/improvement.dto';

@Injectable()
export class ImprovementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit a new continuous product improvement initiative.
   */
  async createImprovement(organizationId: string, createdById: string, dto: CreateImprovementDto) {
    return this.prisma.productImprovement.create({
      data: {
        organizationId,
        title: dto.title,
        problem: dto.description || 'Identified customer or operational drop-off',
        evidence: 'Analytics funnel and user session analysis',
        hypothesis: dto.hypothesizedImpact || 'Improves conversion by reducing interaction steps',
        proposedChange: dto.description || 'Optimized user experience flow',
        expectedImpact: dto.hypothesizedImpact || '+5% Lift',
        priority: dto.priority || 'P2',
        status: ImprovementStatus.IDEA,
        owner: createdById || 'SYSTEM',
        linkedExperimentKey: dto.sourceExperimentId || null,
      },
    });
  }

  /**
   * Updates improvement status, notes, or verified metric lift.
   */
  async updateImprovement(organizationId: string, id: string, dto: UpdateImprovementDto) {
    const existing = await this.prisma.productImprovement.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Product improvement item not found.`);
    }

    return this.prisma.productImprovement.update({
      where: { id },
      data: {
        status: dto.status ?? existing.status,
        priority: dto.priority ?? existing.priority,
        decision: dto.resolutionNotes ?? existing.decision,
      },
    });
  }

  /**
   * Lists product improvement backlog items for an organization.
   */
  async listImprovements(organizationId: string, filter?: { status?: string; category?: string }) {
    const where: any = { organizationId };
    if (filter?.status) where.status = filter.status;

    return this.prisma.productImprovement.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  }
}
