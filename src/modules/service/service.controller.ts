import { Request, Response, NextFunction } from 'express';
import { ServiceService } from './service.service';
import { CreateServiceDTO, UpdateServiceDTO, SearchServicesQuery } from './service.types';

const serviceService = new ServiceService();

export class ServiceController {
  /**
   * POST /api/services
   * Cria um novo serviço
   */
  async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceData: CreateServiceDTO = req.body;

      const service = await serviceService.createService(serviceData);

      res.status(201).json({
        success: true,
        message: 'Serviço criado com sucesso',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/services
   * Busca serviços com filtros
   */
  async searchServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: SearchServicesQuery = req.query;

      const result = await serviceService.searchServices(query);

      res.status(200).json({
        success: true,
        data: result.services,
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
   * GET /api/services/popular
   * Busca serviços populares
   */
  async getPopularServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const services = await serviceService.getPopularServices(limit);

      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/services/recent
   * Busca serviços recentes
   */
  async getRecentServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const services = await serviceService.getRecentServices(limit);

      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/services/:id
   * Busca um serviço específico com detalhes
   */
  async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = String(req.params.id);

      const service = await serviceService.getServiceById(serviceId);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/services/company/:companyId
   * Lista serviços de uma empresa
   */
  async getCompanyServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.companyId);
      const includeInactive = req.query.includeInactive === 'true';

      const services = await serviceService.getCompanyServices(companyId, includeInactive);

      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/services/:id
   * Atualiza um serviço
   */
  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = String(req.params.id);
      const companyId = req.body.companyId; // TODO: Pegar do token JWT quando houver auth de empresa
      const updateData: UpdateServiceDTO = req.body;

      const service = await serviceService.updateService(serviceId, companyId, updateData);

      res.status(200).json({
        success: true,
        message: 'Serviço atualizado com sucesso',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/services/:id/deactivate
   * Desativa um serviço
   */
  async deactivateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = String(req.params.id);
      const companyId = req.body.companyId; // TODO: Pegar do token JWT

      const service = await serviceService.deactivateService(serviceId, companyId);

      res.status(200).json({
        success: true,
        message: 'Serviço desativado com sucesso',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/services/:id/activate
   * Ativa um serviço
   */
  async activateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = String(req.params.id);
      const companyId = req.body.companyId; // TODO: Pegar do token JWT

      const service = await serviceService.activateService(serviceId, companyId);

      res.status(200).json({
        success: true,
        message: 'Serviço ativado com sucesso',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/services/:id
   * Deleta um serviço permanentemente
   */
  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = String(req.params.id);
      const companyId = req.body.companyId; // TODO: Pegar do token JWT

      await serviceService.deleteService(serviceId, companyId);

      res.status(200).json({
        success: true,
        message: 'Serviço deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
