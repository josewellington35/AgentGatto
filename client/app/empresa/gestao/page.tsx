'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Settings, Save, Plus, Trash2, Calendar, BarChart3 } from 'lucide-react';
import { getAuth } from '@/lib/auth';

interface TimeSlotConfig {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // em minutos
  active: boolean;
}

interface Service {
  id: number;
  name: string;
  duration: number;
}

export default function GestaoHorarios() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Configurações padrão: 10 slots de 1 hora (8h às 18h)
  const [slots, setSlots] = useState<TimeSlotConfig[]>([
    { id: '1', startTime: '08:00', endTime: '09:00', duration: 60, active: true },
    { id: '2', startTime: '09:00', endTime: '10:00', duration: 60, active: true },
    { id: '3', startTime: '10:00', endTime: '11:00', duration: 60, active: true },
    { id: '4', startTime: '11:00', endTime: '12:00', duration: 60, active: true },
    { id: '5', startTime: '12:00', endTime: '13:00', duration: 60, active: false }, // Almoço
    { id: '6', startTime: '13:00', endTime: '14:00', duration: 60, active: true },
    { id: '7', startTime: '14:00', endTime: '15:00', duration: 60, active: true },
    { id: '8', startTime: '15:00', endTime: '16:00', duration: 60, active: true },
    { id: '9', startTime: '16:00', endTime: '17:00', duration: 60, active: true },
    { id: '10', startTime: '17:00', endTime: '18:00', duration: 60, active: true },
  ]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const auth = getAuth();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${auth?.token}`
        }
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1h 30min' },
    { value: 120, label: '2 horas' },
  ];

  const toggleSlot = (id: string) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, active: !slot.active } : slot
    ));
  };

  const updateSlotDuration = (id: string, duration: number) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, duration } : slot
    ));
  };

  const addNewSlot = () => {
    const lastSlot = slots[slots.length - 1];
    const newStartTime = lastSlot.endTime;
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const newEndHour = hours + 1;
    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const newSlot: TimeSlotConfig = {
      id: (slots.length + 1).toString(),
      startTime: newStartTime,
      endTime: newEndTime,
      duration: 60,
      active: true
    };
    
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (id: string) => {
    if (slots.length > 1) {
      setSlots(slots.filter(slot => slot.id !== id));
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    // Simulação de salvamento
    setTimeout(() => {
      setSaving(false);
      alert('✅ Configurações salvas com sucesso!');
    }, 1500);
  };

  const activeSlots = slots.filter(s => s.active);
  const totalHoursPerDay = activeSlots.reduce((acc, slot) => acc + slot.duration, 0) / 60;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border border-indigo-100">
          <button
            onClick={() => router.push('/portal')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Voltar ao Portal</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
              <Settings className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Gestão de Horários
              </h1>
              <p className="text-gray-600 mt-1">Configure seus horários de atendimento</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blue-600" size={20} />
                <p className="text-blue-800 font-semibold text-sm">Slots Ativos</p>
              </div>
              <p className="text-3xl font-bold text-blue-900">{activeSlots.length}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="text-green-600" size={20} />
                <p className="text-green-800 font-semibold text-sm">Horas/Dia</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{totalHoursPerDay.toFixed(1)}h</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-purple-600" size={20} />
                <p className="text-purple-800 font-semibold text-sm">Total Slots</p>
              </div>
              <p className="text-3xl font-bold text-purple-900">{slots.length}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-orange-600" size={20} />
                <p className="text-orange-800 font-semibold text-sm">Inativos</p>
              </div>
              <p className="text-3xl font-bold text-orange-900">{slots.length - activeSlots.length}</p>
            </div>
          </div>
        </div>

        {/* Configuração de Slots */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Clock className="text-indigo-600" size={28} />
              Configurar Horários
            </h2>
            
            <button
              onClick={addNewSlot}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Adicionar Slot
            </button>
          </div>

          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div
                key={slot.id}
                className={`border-2 rounded-2xl p-5 transition-all ${
                  slot.active
                    ? 'border-indigo-200 bg-indigo-50/50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="grid md:grid-cols-5 gap-4 items-center">
                  {/* Número do Slot */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      slot.active
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Slot #{index + 1}</p>
                      <p className="font-bold text-gray-800">{slot.startTime} - {slot.endTime}</p>
                    </div>
                  </div>

                  {/* Horário Início */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Início</label>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => {
                        const newSlots = [...slots];
                        newSlots[index].startTime = e.target.value;
                        setSlots(newSlots);
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  {/* Horário Fim */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Fim</label>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => {
                        const newSlots = [...slots];
                        newSlots[index].endTime = e.target.value;
                        setSlots(newSlots);
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  {/* Duração */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Duração</label>
                    <select
                      value={slot.duration}
                      onChange={(e) => updateSlotDuration(slot.id, Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    >
                      {durationOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSlot(slot.id)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                        slot.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {slot.active ? '✓ Ativo' : '✗ Inativo'}
                    </button>
                    
                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(slot.id)}
                        className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Pronto para salvar?</h3>
              <p className="text-indigo-100">
                Suas configurações serão aplicadas imediatamente e os clientes verão os novos horários disponíveis.
              </p>
            </div>
            <button
              onClick={saveConfiguration}
              disabled={saving}
              className="flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-lg"
            >
              <Save size={24} />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-indigo-400">
            <div className="text-center">
              <p className="text-4xl font-bold mb-1">{activeSlots.length}</p>
              <p className="text-indigo-200">Horários Disponíveis</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-1">{totalHoursPerDay.toFixed(1)}h</p>
              <p className="text-indigo-200">Horas por Dia</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-1">{(activeSlots.length * 7).toFixed(0)}</p>
              <p className="text-indigo-200">Slots por Semana</p>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
            💡 Dicas Importantes
          </h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Configure pelo menos 8-10 slots por dia para maximizar seus agendamentos</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Slots inativos são úteis para horários de almoço ou pausas</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Você pode ajustar a duração de cada slot conforme o tipo de serviço</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>As alterações são aplicadas imediatamente e afetam apenas agendamentos futuros</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
