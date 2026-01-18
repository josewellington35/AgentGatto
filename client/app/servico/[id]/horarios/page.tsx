'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, DollarSign, MapPin, Star, Check, X } from 'lucide-react';
import { getAuth } from '@/lib/auth';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date: string;
}

export default function Horarios() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadService();
  }, [params.id]);

  const loadService = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${params.id}`);
      const data = await response.json();
      setService(data);
    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerar slots de horário (10 por dia padrão - 8h às 18h)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        id: `${selectedDate}-${hour}:00`,
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // Simulação - 70% disponível
        date: selectedDate
      });
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleBooking = async () => {
    if (!selectedSlot || !service) return;
    
    setBooking(true);
    const auth = getAuth();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`
        },
        body: JSON.stringify({
          service_id: service.id,
          date: selectedSlot.date,
          time: selectedSlot.time,
          notes: ''
        })
      });

      if (response.ok) {
        alert('✅ Agendamento realizado com sucesso!');
        router.push('/cliente/agendamentos');
      } else {
        alert('❌ Erro ao realizar agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao realizar agendamento');
    } finally {
      setBooking(false);
    }
  };

  // Gerar próximos 7 dias
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando horários...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">Serviço não encontrado</p>
          <button
            onClick={() => router.push('/explorar')}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700"
          >
            Voltar para Explorar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header com Info do Serviço */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border border-purple-100">
          <button
            onClick={() => router.push('/explorar')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Voltar</span>
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                  <Calendar className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{service.name}</h1>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
                  <Clock size={18} className="text-purple-600" />
                  <span className="font-semibold text-purple-800">{service.duration} min</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
                  <DollarSign size={18} className="text-green-600" />
                  <span className="font-bold text-green-800">R$ {service.price}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-xl">
                  <Star size={18} className="text-yellow-600 fill-yellow-600" />
                  <span className="font-semibold text-yellow-800">4.8 (127)</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
              <p className="text-sm text-purple-800 font-semibold mb-2">📍 Localização</p>
              <p className="text-gray-700 font-medium mb-4">Centro, São Paulo - SP</p>
              <p className="text-sm text-purple-800 font-semibold mb-2">⏰ Funcionamento</p>
              <p className="text-gray-700">Seg - Sex: 8h às 18h</p>
              <p className="text-gray-700">Sáb: 9h às 14h</p>
            </div>
          </div>
        </div>

        {/* Seleção de Data */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Calendar className="text-purple-600" size={28} />
            Selecione uma Data
          </h2>
          
          <div className="grid grid-cols-7 gap-3">
            {getNextDays().map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-4 rounded-2xl transition-all text-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <p className={`text-xs mb-1 ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                  </p>
                  <p className="text-2xl font-bold">
                    {date.getDate()}
                  </p>
                  <p className={`text-xs ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                    {date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade de Horários */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Clock className="text-purple-600" size={28} />
            Horários Disponíveis
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && setSelectedSlot(slot)}
                disabled={!slot.available}
                className={`p-4 rounded-2xl font-bold transition-all text-center ${
                  selectedSlot?.id === slot.id
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : slot.available
                    ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {slot.available ? (
                    selectedSlot?.id === slot.id ? (
                      <Check size={16} />
                    ) : (
                      <Clock size={16} />
                    )
                  ) : (
                    <X size={16} />
                  )}
                  {slot.time}
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {slot.available ? 'Disponível' : 'Ocupado'}
                </p>
              </button>
            ))}
          </div>

          {timeSlots.filter(s => s.available).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum horário disponível para esta data</p>
              <p className="text-gray-400 mt-2">Tente selecionar outro dia</p>
            </div>
          )}
        </div>

        {/* Botão de Confirmação */}
        {selectedSlot && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm mb-1">Horário Selecionado</p>
                <p className="text-2xl font-bold">
                  {new Date(selectedSlot.date).toLocaleDateString('pt-BR')} às {selectedSlot.time}
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm mb-1">Valor Total</p>
                <p className="text-3xl font-bold">R$ {service.price}</p>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={booking}
              className="w-full bg-white text-purple-600 py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-lg"
            >
              {booking ? 'Confirmando...' : '✨ Confirmar Agendamento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
