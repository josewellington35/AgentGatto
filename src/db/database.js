require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

class Database {
  // Usuários
  static async createUser(name, email, password, phone, role = 'client') {
    const result = await sql`
      INSERT INTO users (name, email, password, phone, role)
      VALUES (${name}, ${email}, ${password}, ${phone}, ${role})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async getUserByEmail(email) {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.rows[0];
  }

  static async getUserById(id) {
    const result = await sql`
      SELECT id, name, email, phone, role, created_at FROM users WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0];
  }

  static async getAllUsers() {
    const result = await sql`
      SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC
    `;
    return result.rows;
  }

  static async updateUser(id, updates) {
    const { name, phone } = updates;
    const result = await sql`
      UPDATE users 
      SET name = COALESCE(${name}, name),
          phone = COALESCE(${phone}, phone),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone, role, created_at
    `;
    return result.rows[0];
  }

  // Serviços
  static async createService(name, description, duration, price) {
    const result = await sql`
      INSERT INTO services (name, description, duration, price)
      VALUES (${name}, ${description}, ${duration}, ${price})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async getAllServices(activeOnly = true) {
    const result = activeOnly
      ? await sql`SELECT * FROM services WHERE active = true ORDER BY name`
      : await sql`SELECT * FROM services ORDER BY name`;
    return result.rows;
  }

  static async getServiceById(id) {
    const result = await sql`
      SELECT * FROM services WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0];
  }

  static async updateService(id, updates) {
    const { name, description, duration, price, active } = updates;
    const result = await sql`
      UPDATE services 
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          duration = COALESCE(${duration}, duration),
          price = COALESCE(${price}, price),
          active = COALESCE(${active}, active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async deleteService(id) {
    await sql`DELETE FROM services WHERE id = ${id}`;
  }

  // Agendamentos
  static async createAppointment(userId, serviceId, appointmentDate, notes) {
    const result = await sql`
      INSERT INTO appointments (user_id, service_id, appointment_date, notes)
      VALUES (${userId}, ${serviceId}, ${appointmentDate}, ${notes})
      RETURNING *
    `;
    return result.rows[0];
  }

  static async getAppointmentById(id) {
    const result = await sql`
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.name as service_name,
        s.duration as service_duration,
        s.price as service_price
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ${id}
      LIMIT 1
    `;
    return result.rows[0];
  }

  static async getAppointmentsByUser(userId) {
    const result = await sql`
      SELECT 
        a.*,
        s.name as service_name,
        s.duration as service_duration,
        s.price as service_price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ${userId}
      ORDER BY a.appointment_date DESC
    `;
    return result.rows;
  }

  static async getAllAppointments(status = null) {
    const result = status
      ? await sql`
          SELECT 
            a.*,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            s.name as service_name,
            s.duration as service_duration,
            s.price as service_price
          FROM appointments a
          JOIN users u ON a.user_id = u.id
          JOIN services s ON a.service_id = s.id
          WHERE a.status = ${status}
          ORDER BY a.appointment_date DESC
        `
      : await sql`
          SELECT 
            a.*,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            s.name as service_name,
            s.duration as service_duration,
            s.price as service_price
          FROM appointments a
          JOIN users u ON a.user_id = u.id
          JOIN services s ON a.service_id = s.id
          ORDER BY a.appointment_date DESC
        `;
    return result.rows;
  }

  static async updateAppointmentStatus(id, status) {
    const result = await sql`
      UPDATE appointments 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  }

  static async deleteAppointment(id) {
    await sql`DELETE FROM appointments WHERE id = ${id}`;
  }

  static async getAvailableSlots(date) {
    // Busca agendamentos do dia
    const result = await sql`
      SELECT appointment_date, duration 
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE DATE(appointment_date) = DATE(${date})
      AND status != 'cancelled'
      ORDER BY appointment_date
    `;
    return result.rows;
  }
}

module.exports = Database;
