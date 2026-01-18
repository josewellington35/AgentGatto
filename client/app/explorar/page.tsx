'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, DollarSign, MapPin, Star, Search, Filter, Sparkles } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: string;
  active: boolean;
}

export default function Explorar() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todos', icon: '🎯', color: 'purple' },
    { id: 'beauty', name: 'Beleza', icon: '💇', color: 'pink' },
    { id: 'auto', name: 'Automotivo', icon: '🚗', color: 'blue' },
    { id: 'health', name: 'Saúde', icon: '🏥', color: 'green' },
    { id: 'food', name: 'Alimentação', icon: '🍔', color: 'orange' },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && service.active;
  });

  const getRandomColor = (index: number) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando estabelecimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border border-purple-100">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/portal')}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-purple-600" size={28} />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Explorar Serviços
                </h1>
              </div>
              <p className="text-gray-600 ml-11">Descubra os melhores estabelecimentos da região</p>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por serviço, estabelecimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all text-lg"
            />
          </div>

          {/* Filtros por Categoria */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter className="text-gray-500" size={20} />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r from-${cat.color}-500 to-${cat.color}-600 text-white shadow-lg scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Serviços */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou a busca</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                onClick={() => router.push(`/servico/${service.id}/horarios`)}
                className="group cursor-pointer"
              >
                <div className="h-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 border border-gray-100">
                  {/* Header do Card com Gradiente */}
                  <div className={`h-32 bg-gradient-to-r ${getRandomColor(index)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="font-bold text-gray-800">4.8</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                        <p className="text-white font-bold text-xs">Disponível Agora</p>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">
                      {service.description}
                    </p>

                    {/* Informações */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Clock size={18} className="text-purple-600" />
                        </div>
                        <span className="font-medium">{service.duration} minutos</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign size={18} className="text-green-600" />
                        </div>
                        <span className="font-bold text-xl text-green-600">R$ {service.price}</span>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all group-hover:scale-105 flex items-center justify-center gap-2">
                      Ver Horários Disponíveis
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>

                  {/* Badge de Categoria (simulado) */}
                  <div className="absolute top-36 left-6">
                    <div className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                      ⚡ Popular
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas Footer */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">{services.length}+</p>
              <p className="text-purple-100">Serviços Disponíveis</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">1000+</p>
              <p className="text-purple-100">Agendamentos Realizados</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">4.9⭐</p>
              <p className="text-purple-100">Avaliação Média</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-purple-100">Atendimento Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
