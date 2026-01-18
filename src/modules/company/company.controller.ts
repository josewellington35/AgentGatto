import { Request, Response, NextFunction } from 'express';
import { CompanyService } from './company.service';
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyStatusDTO,
  CreateTimeSlotDTO,
  UpdateTimeSlotDTO,
  SearchCompaniesQuery,
} from './company.types';

const companyService = new CompanyService();

export class CompanyController {
  /**
   * POST /api/companies
   * Cria uma nova empresa
   */
  async createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyData: CreateCompanyDTO = req.body;

      const company = await companyService.createCompany(companyData);

      res.status(201).json({
        success: true,
        message: 'Empresa cadastrada com sucesso. Aguardando aprovação.',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/companies
   * Busca empresas com filtros
   */
  async searchCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: SearchCompaniesQuery = req.query;

      const result = await companyService.searchCompanies(query);

      res.status(200).json({
        success: true,
        data: result.companies,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/companies/pending
   * Lista empresas pendentes (Admin)
   */
  async getPendingCompanies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companies = await companyService.getPendingCompanies();

      res.status(200).json({
        success: true,
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/companies/:id
   * Busca uma empresa específica
   */
  async getCompanyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const includeDetails = req.query.details !== 'false';

      const company = await companyService.getCompanyById(companyId, includeDetails);

      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/companies/:id/stats
   * Busca estatísticas da empresa
   */
  async getCompanyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);

      const stats = await companyService.getCompanyStats(companyId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/companies/:id
   * Atualiza dados da empresa
   */
  async updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const updateData: UpdateCompanyDTO = req.body;

      // TODO: Verificar se usuário tem permissão (é o dono da empresa)

      const company = await companyService.updateCompany(companyId, updateData);

      res.status(200).json({
        success: true,
        message: 'Empresa atualizada com sucesso',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/companies/:id/status
   * Atualiza status da empresa (Admin)
   */
  async updateCompanyStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const statusData: UpdateCompanyStatusDTO = req.body;

      const company = await companyService.updateCompanyStatus(companyId, statusData);

      res.status(200).json({
        success: true,
        message: 'Status da empresa atualizado',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/companies/:id
   * Deleta uma empresa (soft delete)
   */
  async deleteCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);

      await companyService.deleteCompany(companyId);

      res.status(200).json({
        success: true,
        message: 'Empresa removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== TIME SLOTS =====

  /**
   * POST /api/companies/:id/timeslots
   * Cria um time slot para a empresa
   */
  async createTimeSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const timeSlotData: CreateTimeSlotDTO = {
        ...req.body,
        companyId,
      };

      const timeSlot = await companyService.createTimeSlot(timeSlotData);

      res.status(201).json({
        success: true,
        message: 'Horário criado com sucesso',
        data: timeSlot,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/companies/:id/timeslots
   * Lista time slots da empresa
   */
  async getCompanyTimeSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const includeInactive = req.query.includeInactive === 'true';

      const timeSlots = await companyService.getCompanyTimeSlots(companyId, includeInactive);

      res.status(200).json({
        success: true,
        data: timeSlots,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/companies/:id/timeslots/:timeSlotId
   * Atualiza um time slot
   */
  async updateTimeSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const timeSlotId = String(req.params.timeSlotId);
      const updateData: UpdateTimeSlotDTO = req.body;

      const timeSlot = await companyService.updateTimeSlot(timeSlotId, companyId, updateData);

      res.status(200).json({
        success: true,
        message: 'Horário atualizado com sucesso',
        data: timeSlot,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/companies/:id/timeslots/:timeSlotId
   * Deleta um time slot
   */
  async deleteTimeSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.id);
      const timeSlotId = String(req.params.timeSlotId);

      await companyService.deleteTimeSlot(timeSlotId, companyId);

      res.status(200).json({
        success: true,
        message: 'Horário removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
