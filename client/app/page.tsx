'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, Shield, Sparkles, TrendingUp, Star, Zap, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center py-20 mb-16">
          <div 
            className="inline-block mb-6"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-purple-200 mb-8">
              <Sparkles className="text-purple-600" size={20} />
              <span className="text-purple-800 font-semibold">Plataforma #1 de Agendamentos</span>
              <Star className="text-yellow-500 fill-yellow-500" size={18} />
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Agende Tudo
            </span>
            <br />
            <span className="text-gray-800">Em Um Só Lugar</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Conecte-se aos melhores estabelecimentos da sua região. 
            <span className="font-bold text-purple-700"> Salões, oficinas, clínicas</span> e muito mais, 
            tudo na palma da sua mão! 🚀
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/cadastro"
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <Zap className="group-hover:rotate-12 transition-transform" size={24} />
              Começar Gratuitamente
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              href="/login"
              className="bg-white/90 backdrop-blur-sm text-purple-600 px-10 py-5 rounded-2xl text-lg font-bold border-2 border-purple-300 hover:bg-white hover:border-purple-500 transition-all hover:scale-105 inline-flex items-center justify-center gap-3 shadow-xl"
            >
              Fazer Login
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '50K+', label: 'Usuários Ativos', icon: Users },
              { number: '200+', label: 'Estabelecimentos', icon: Award },
              { number: '1M+', label: 'Agendamentos', icon: Calendar },
              { number: '4.9★', label: 'Avaliação', icon: Star }
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50">
                <stat.icon className="text-purple-600 mx-auto mb-2" size={28} />
                <p className="text-3xl font-black text-gray-800 mb-1">{stat.number}</p>
                <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Por Que Escolher a Gente?
            </h2>
            <p className="text-xl text-gray-600">Recursos que fazem a diferença no seu dia a dia</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Calendar, 
                title: 'Agendamento Instantâneo', 
                desc: 'Reserve em segundos, 24/7',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-100'
              },
              { 
                icon: Clock, 
                title: 'Horários Flexíveis', 
                desc: 'Encontre o melhor horário pra você',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-100'
              },
              { 
                icon: Shield, 
                title: 'Pagamento Seguro', 
                desc: 'Transações 100% protegidas',
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-100'
              },
              { 
                icon: TrendingUp, 
                title: 'Sem Filas', 
                desc: 'Esqueça as esperas intermináveis',
                color: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-100'
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className={`${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-white overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-center">Como Funciona?</h2>
              <p className="text-xl text-purple-100 text-center mb-12">Três passos simples para começar</p>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Crie sua Conta', desc: 'Cadastro rápido e gratuito em menos de 1 minuto', icon: Users },
                  { step: '02', title: 'Escolha o Serviço', desc: 'Navegue pelos estabelecimentos e selecione', icon: Calendar },
                  { step: '03', title: 'Confirme o Horário', desc: 'Pronto! Receba confirmação instantânea', icon: CheckCircle }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-4 hover:bg-white/30 transition-all">
                      <div className="inline-block bg-white text-purple-600 w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl mb-4">
                        {item.step}
                      </div>
                      <item.icon className="mx-auto mb-4" size={40} />
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-purple-100">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50">
          <Sparkles className="mx-auto mb-6 text-purple-600" size={48} />
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-800">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão agendando de forma inteligente
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
          >
            <Zap size={28} />
            Criar Conta Grátis Agora
            <ArrowRight size={24} />
          </Link>
          <p className="text-sm text-gray-500 mt-6">✓ Sem cartão de crédito • ✓ Sem compromisso • ✓ Cancelamento gratuito</p>
        </section>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
