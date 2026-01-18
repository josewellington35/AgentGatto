'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Plus, ArrowLeft, Filter } from 'lucide-react';

interface Appointment {
  id: number;
  service_name: string;
  service_duration: number;
  service_price: string;
  appointment_date: string;
  status: string;
  notes?: string;
}

export default function ClienteAgendamentos() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

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
      // Buscar agendamentos do cliente
      const appointmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData);

      // Buscar serviços disponíveis
      const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
      const servicesData = await servicesRes.json();
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-800">Meus Agendamentos</h1>
                <p className="text-gray-600">Gerencie todos seus agendamentos em um só lugar</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={20} className="text-gray-600" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmados
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Concluídos
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Você ainda não tem agendamentos. Comece agendando um serviço!'
                : `Você não tem agendamentos ${getStatusText(filter).toLowerCase()}`
              }
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Fazer Primeiro Agendamento
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{apt.service_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-purple-600" />
                        <span>{new Date(apt.appointment_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-purple-600" />
                        <span>{new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {apt.service_duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-purple-600" />
                        <span className="font-semibold">R$ {apt.service_price}</span>
                      </div>
                    </div>
                    
                    {apt.notes && (
                      <p className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        <strong>Observações:</strong> {apt.notes}
                      </p>
                    )}
                  </div>
                  
                  {apt.status === 'pending' && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${apt.id}/status`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ status: 'cancelled' })
                        });
                        loadData();
                      }}
                      className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Agendamento */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Novo Agendamento</h2>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Serviços Disponíveis</h3>
              {services.length === 0 ? (
                <p className="text-gray-600">Nenhum serviço disponível no momento.</p>
              ) : (
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        router.push(`/cliente/agendar/${service.id}`);
                      }}
                      className="text-left p-4 border-2 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all"
                    >
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {service.duration} min
                        </span>
                        <span className="font-semibold text-purple-600">R$ {service.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowNewModal(false)}
              className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
