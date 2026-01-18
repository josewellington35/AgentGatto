import { Resend } from 'resend';
import { env } from '@/config/env';
import { logger } from './logger';

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  private readonly from = 'AgentGatto <noreply@agentgatto.com>';

  async sendWelcomeEmail(user: { name: string; email: string }): Promise<void> {
    try {
      await resend.emails.send({
        from: this.from,
        to: user.email,
        subject: 'Bem-vindo ao AgentGatto!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">Olá ${user.name}!</h1>
            <p>Bem-vindo ao AgentGatto, sua plataforma de agendamentos online!</p>
            <p>Agora você pode:</p>
            <ul>
              <li>Agendar serviços em estabelecimentos parceiros</li>
              <li>Gerenciar seus agendamentos</li>
              <li>Avaliar e comentar sobre os serviços</li>
            </ul>
            <p>Qualquer dúvida, estamos à disposição!</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
              Equipe AgentGatto
            </p>
          </div>
        `,
      });

      logger.info('Welcome email sent', { userEmail: user.email });
    } catch (error) {
      logger.error('Failed to send welcome email', { error, userEmail: user.email });
      throw error;
    }
  }

  async sendBookingConfirmation(booking: {
    id: string;
    user: { name: string; email: string };
    service: { name: string; company: { name: string } };
    date: Date;
    timeSlot: string;
    totalPrice: number;
  }): Promise<void> {
    try {
      const formattedDate = new Date(booking.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await resend.emails.send({
        from: this.from,
        to: booking.user.email,
        subject: 'Agendamento Criado - AgentGatto',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">Agendamento Criado!</h1>
            <p>Olá ${booking.user.name},</p>
            <p>Seu agendamento foi criado com sucesso e está aguardando confirmação do estabelecimento.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Detalhes do Agendamento</h2>
              <p><strong>Serviço:</strong> ${booking.service.name}</p>
              <p><strong>Estabelecimento:</strong> ${booking.service.company.name}</p>
              <p><strong>Data:</strong> ${formattedDate}</p>
              <p><strong>Horário:</strong> ${booking.timeSlot}</p>
              <p><strong>Valor:</strong> R$ ${Number(booking.totalPrice).toFixed(2)}</p>
            </div>
            
            <p>Você receberá um email quando o estabelecimento confirmar seu agendamento.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
              Equipe AgentGatto
            </p>
          </div>
        `,
      });

      logger.info('Booking confirmation email sent', {
        bookingId: booking.id,
        userEmail: booking.user.email,
      });
    } catch (error) {
      logger.error('Failed to send booking confirmation email', {
        error,
        bookingId: booking.id,
      });
      throw error;
    }
  }

  async sendBookingStatusUpdate(booking: {
    id: string;
    user: { name: string; email: string };
    service: { name: string; company: { name: string } };
    status: string;
    date: Date;
    timeSlot: string;
  }): Promise<void> {
    try {
      const statusMessages = {
        CONFIRMED: 'confirmado',
        CANCELLED: 'cancelado',
        COMPLETED: 'concluído',
      };

      const message = statusMessages[booking.status as keyof typeof statusMessages] || booking.status;

      await resend.emails.send({
        from: this.from,
        to: booking.user.email,
        subject: `Agendamento ${message} - AgentGatto`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">Atualização de Agendamento</h1>
            <p>Olá ${booking.user.name},</p>
            <p>Seu agendamento foi <strong>${message}</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Serviço:</strong> ${booking.service.name}</p>
              <p><strong>Estabelecimento:</strong> ${booking.service.company.name}</p>
              <p><strong>Data:</strong> ${new Date(booking.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> ${booking.timeSlot}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
              Equipe AgentGatto
            </p>
          </div>
        `,
      });

      logger.info('Booking status update email sent', {
        bookingId: booking.id,
        status: booking.status,
      });
    } catch (error) {
      logger.error('Failed to send booking status update email', {
        error,
        bookingId: booking.id,
      });
      throw error;
    }
  }

  async sendBookingReminder(booking: {
    user: { name: string; email: string };
    service: { name: string; company: { name: string; address: string } };
    date: Date;
    timeSlot: string;
    hoursUntil: number;
  }): Promise<void> {
    try {
      await resend.emails.send({
        from: this.from,
        to: booking.user.email,
        subject: `Lembrete: Agendamento em ${booking.hoursUntil}h - AgentGatto`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">Lembrete de Agendamento</h1>
            <p>Olá ${booking.user.name},</p>
            <p>Seu agendamento está próximo!</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 18px; margin: 0;">
                <strong>Em ${booking.hoursUntil} hora${booking.hoursUntil > 1 ? 's' : ''}</strong>
              </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Serviço:</strong> ${booking.service.name}</p>
              <p><strong>Estabelecimento:</strong> ${booking.service.company.name}</p>
              <p><strong>Endereço:</strong> ${booking.service.company.address}</p>
              <p><strong>Data:</strong> ${new Date(booking.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> ${booking.timeSlot}</p>
            </div>
            
            <p>Não se esqueça de chegar com alguns minutos de antecedência!</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
              Equipe AgentGatto
            </p>
          </div>
        `,
      });

      logger.info('Booking reminder email sent', { userEmail: booking.user.email });
    } catch (error) {
      logger.error('Failed to send booking reminder email', { error });
      throw error;
    }
  }
}

// Singleton
export const emailService = new EmailService();
