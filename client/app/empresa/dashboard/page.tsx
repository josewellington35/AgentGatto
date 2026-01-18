'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Settings, Plus, ArrowLeft, TrendingUp } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: string;
  active: boolean;
}

interface Appointment {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  service_name: string;
  appointment_date: string;
  status: string;
  notes?: string;
}

export default function EmpresaDashboard() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewService, setShowNewService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Buscar serviços
      const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const servicesData = await servicesRes.json();
      setServices(servicesData.services || []);

      // Buscar agendamentos
      const appointmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newService)
      });

      if (response.ok) {
        setShowNewService(false);
        setNewService({ name: '', description: '', duration: 30, price: '' });
        loadData();
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return texts[status] || status;
  };

  const stats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.active).length,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
    todayAppointments: appointments.filter(a => {
      const date = new Date(a.appointment_date);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/portal')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Painel da Empresa</h1>
                <p className="text-gray-600">Gerencie seus serviços e agendamentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="text-green-600" size={20} />
              <p className="text-sm text-gray-600">Serviços</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalServices}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <p className="text-sm text-gray-600">Ativos</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.activeServices}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-600" size={20} />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-yellow-600" size={20} />
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingAppointments}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-600" size={20} />
              <p className="text-sm text-gray-600">Confirmados</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.confirmedAppointments}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-red-600" size={20} />
              <p className="text-sm text-gray-600">Hoje</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.todayAppointments}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Serviços */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Meus Serviços</h2>
              <button
                onClick={() => setShowNewService(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                Novo
              </button>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-12">
                <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Nenhum serviço cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border-2 ${
                      service.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {service.duration} min
                          </span>
                          <span className="font-semibold text-green-600">R$ {service.price}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agendamentos */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Agendamentos Recentes</h2>

            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Nenhum agendamento ainda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointments.slice(0, 10).map((apt) => (
                  <div key={apt.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{apt.user_name}</h3>
                        <p className="text-sm text-gray-600">{apt.service_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span>{new Date(apt.appointment_date).toLocaleDateString('pt-BR')}</span>
                      <span>{new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                          className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                          className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Novo Serviço */}
      {showNewService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-6">Novo Serviço</h2>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração (min)</label>
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    min="15"
                    step="15"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Criar Serviço
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewService(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
