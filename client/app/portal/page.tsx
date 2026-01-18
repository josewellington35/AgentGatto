'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Briefcase, LogOut, Sparkles, Store } from 'lucide-react';

export default function Portal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          <Sparkles className="absolute inset-0 m-auto text-white animate-pulse" size={24} />
        </div>
      </div>
    );
  }

  const isProvider = user?.role === 'admin' || user?.role === 'provider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 relative overflow-hidden">
      {/* Efeito de fundo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header com Glassmorphism */}
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Sparkles className="text-white" size={24} />
                </div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  Olá, {user?.name}!
                </h1>
              </div>
              <p className="text-white/90 text-lg ml-14">
                {isProvider ? '✨ Seu espaço de gerenciamento' : '🎯 Encontre os melhores serviços'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all border border-white/30 hover:scale-105"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>

        {/* Cards de Ação com Design Moderno */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Card Cliente - Explorar Serviços */}
          <div 
            onClick={() => router.push('/explorar')}
            className="group cursor-pointer"
          >
            <div className="h-full backdrop-blur-lg bg-white/95 rounded-3xl shadow-2xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 border border-white/50 overflow-hidden relative">
              {/* Efeito de brilho animado */}
              <div className="absolute -top-40 -right-40 w-60 h-60 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Store size={40} className="text-white" />
                  </div>
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2">
                    <Sparkles size={16} />
                    Novo
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors">
                  Explorar Serviços
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Descubra estabelecimentos incríveis perto de você. Salões, oficinas, clínicas e muito mais!
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full group-hover:w-full transition-all duration-700 w-1/2"></div>
                  </div>
                  <span className="text-purple-600 font-bold text-lg group-hover:translate-x-2 transition-transform">→</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">50+</p>
                    <p className="text-xs text-gray-600">Serviços</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">24/7</p>
                    <p className="text-xs text-gray-600">Disponível</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-pink-600">★ 4.9</p>
                    <p className="text-xs text-gray-600">Avaliação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Empresa */}
          {isProvider ? (
            <div 
              onClick={() => router.push('/empresa/gestao')}
              className="group cursor-pointer"
            >
              <div className="h-full backdrop-blur-lg bg-white/95 rounded-3xl shadow-2xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 border border-white/50 overflow-hidden relative">
                <div className="absolute -top-40 -right-40 w-60 h-60 bg-gradient-to-br from-green-400 to-teal-500 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Briefcase size={40} className="text-white" />
                    </div>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      Admin
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-green-700 transition-colors">
                    Gestão Empresarial
                  </h2>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Gerencie horários, serviços e atenda seus clientes com eficiência total
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gradient-to-r from-green-200 to-teal-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-teal-600 rounded-full group-hover:w-full transition-all duration-700 w-2/3"></div>
                    </div>
                    <span className="text-green-600 font-bold text-lg group-hover:translate-x-2 transition-transform">→</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{appointments.length || 0}</p>
                      <p className="text-xs text-gray-600">Agendamentos</p>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-teal-600">98%</p>
                      <p className="text-xs text-gray-600">Satisfação</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">Live</p>
                      <p className="text-xs text-gray-600">Status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => router.push('/empresa/solicitar')}
              className="group cursor-pointer"
            >
              <div className="h-full backdrop-blur-lg bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-2xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 border-2 border-orange-200 border-dashed overflow-hidden relative">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-300 opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center">
                  <div className="inline-block p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <Briefcase size={40} className="text-white" />
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Seja um Parceiro
                  </h2>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    Cadastre sua empresa e comece a receber agendamentos hoje mesmo!
                  </p>

                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <Sparkles size={20} />
                    Cadastrar Empresa
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-sm text-gray-600">✓ Sem taxas iniciais</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-sm text-gray-600">✓ Suporte 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meus Agendamentos - Card Compacto */}
        <div 
          onClick={() => router.push('/meus-agendamentos')}
          className="backdrop-blur-lg bg-white/95 rounded-3xl shadow-xl p-6 border border-white/50 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Calendar size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                  Meus Agendamentos
                </h3>
                <p className="text-gray-600">Acompanhe todos seus compromissos</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-600 group-hover:translate-x-2 transition-transform">
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
