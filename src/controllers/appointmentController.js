const Database = require('../db/database');

class AppointmentController {
  static async create(req, res) {
    try {
      const { service_id, appointment_date, notes } = req.body;
      const user_id = req.user.id;

      if (!service_id || !appointment_date) {
        return res.status(400).json({ error: 'Serviço e data são obrigatórios' });
      }

      // Verifica se o serviço existe
      const service = await Database.getServiceById(service_id);
      if (!service) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Verifica se a data é futura
      const appointmentDate = new Date(appointment_date);
      if (appointmentDate < new Date()) {
        return res.status(400).json({ error: 'Data deve ser futura' });
      }

      const appointment = await Database.createAppointment(
        user_id,
        service_id,
        appointment_date,
        notes
      );

      const fullAppointment = await Database.getAppointmentById(appointment.id);

      res.status(201).json({
        message: 'Agendamento criado com sucesso',
        appointment: fullAppointment
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }

  static async getAll(req, res) {
    try {
      const { status } = req.query;
      let appointments;

      if (req.user.role === 'admin') {
        appointments = await Database.getAllAppointments(status);
      } else {
        appointments = await Database.getAppointmentsByUser(req.user.id);
        if (status) {
          appointments = appointments.filter(a => a.status === status);
        }
      }

      res.json({ appointments });
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Database.getAppointmentById(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Verifica permissão
      if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json({ appointment });
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const appointment = await Database.getAppointmentById(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Usuários só podem cancelar seus próprios agendamentos
      if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (req.user.role !== 'admin' && status !== 'cancelled') {
        return res.status(403).json({ error: 'Apenas administradores podem alterar o status' });
      }

      const updated = await Database.updateAppointmentStatus(id, status);

      res.json({
        message: 'Status atualizado com sucesso',
        appointment: updated
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Database.getAppointmentById(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await Database.deleteAppointment(id);

      res.json({ message: 'Agendamento removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      res.status(500).json({ error: 'Erro ao remover agendamento' });
    }
  }

  static async getAvailableSlots(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Data é obrigatória' });
      }

      const slots = await Database.getAvailableSlots(date);

      res.json({ date, bookedSlots: slots });
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
    }
  }
}

module.exports = AppointmentController;
