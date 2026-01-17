import Link from 'next/link';
import { Calendar, Clock, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-3xl shadow-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Agendamentos Simples e Rápidos
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-purple-100">
          Gerencie seus compromissos de forma profissional
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/cadastro"
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-purple-50 transition shadow-lg"
          >
            Começar Agora
          </Link>
          <Link
            href="/login"
            className="bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-purple-800 transition shadow-lg border-2 border-white"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Agendamento Fácil</h3>
          <p className="text-gray-600">
            Agende seus serviços em poucos cliques
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Disponibilidade 24/7</h3>
          <p className="text-gray-600">
            Acesse a qualquer hora, de qualquer lugar
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Gerenciamento Completo</h3>
          <p className="text-gray-600">
            Acompanhe todos os seus agendamentos
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Segurança Garantida</h3>
          <p className="text-gray-600">
            Seus dados protegidos e criptografados
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 p-12 rounded-3xl text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Crie sua conta gratuitamente e comece a agendar agora mesmo
        </p>
        <Link
          href="/cadastro"
          className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-purple-700 transition inline-block shadow-lg"
        >
          Criar Conta Grátis
        </Link>
      </section>
    </div>
  );
}
