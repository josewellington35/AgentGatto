const Database = require('../db/database');

class ServiceController {
  static async create(req, res) {
    try {
      const { name, description, duration, price } = req.body;

      if (!name || !duration || !price) {
        return res.status(400).json({ error: 'Nome, duração e preço são obrigatórios' });
      }

      const service = await Database.createService(name, description, duration, price);

      res.status(201).json({
        message: 'Serviço criado com sucesso',
        service
      });
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      res.status(500).json({ error: 'Erro ao criar serviço' });
    }
  }

  static async getAll(req, res) {
    try {
      const { active } = req.query;
      const services = await Database.getAllServices(active !== 'false');

      res.json({ services });
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      res.status(500).json({ error: 'Erro ao listar serviços' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await Database.getServiceById(id);

      if (!service) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      res.json({ service });
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(500).json({ error: 'Erro ao buscar serviço' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const service = await Database.updateService(id, updates);

      if (!service) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      res.json({
        message: 'Serviço atualizado com sucesso',
        service
      });
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      await Database.deleteService(id);

      res.json({ message: 'Serviço removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      res.status(500).json({ error: 'Erro ao remover serviço' });
    }
  }
}

module.exports = ServiceController;
