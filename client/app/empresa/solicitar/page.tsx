'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Send, CheckCircle } from 'lucide-react';

export default function SolicitarParceria() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'beauty', label: '💇 Salão de Beleza', icon: '💇' },
    { value: 'auto', label: '🚗 Lava-Rápido / Oficina', icon: '🚗' },
    { value: 'health', label: '🏥 Clínica / Consultório', icon: '🏥' },
    { value: 'food', label: '🍔 Restaurante / Lanchonete', icon: '🍔' },
    { value: 'pet', label: '🐾 Pet Shop / Veterinária', icon: '🐾' },
    { value: 'other', label: '⭐ Outro Segmento', icon: '⭐' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulação de envio
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 animate-bounce">
              <CheckCircle size={64} className="text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎉 Solicitação Enviada!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Recebemos sua solicitação para se tornar parceiro! Nossa equipe irá analisar e entrar em contato em até 24 horas.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-3">📬 Próximos Passos:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  <span>Análise da documentação (24h)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <span>Aprovação e configuração da conta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <span>Treinamento e boas-vindas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">4.</span>
                  <span>Início dos agendamentos!</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/portal')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
              >
                Voltar ao Portal
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    companyName: '',
                    ownerName: '',
                    email: '',
                    phone: '',
                    address: '',
                    category: '',
                    description: ''
                  });
                }}
                className="flex-1 bg-white text-purple-600 border-2 border-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all"
              >
                Nova Solicitação
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border border-orange-100">
          <button
            onClick={() => router.push('/portal')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Voltar</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl">
              <Building2 className="text-white" size={40} />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Seja um Parceiro
              </h1>
              <p className="text-gray-600 mt-1">Faça parte da nossa rede e impulsione seu negócio</p>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-bold mb-2">Mais Clientes</h3>
            <p className="text-blue-100">Alcance milhares de potenciais clientes na sua região</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="text-xl font-bold mb-2">Gestão Automática</h3>
            <p className="text-green-100">Sistema inteligente de agendamentos e horários</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold mb-2">Sem Custos Iniciais</h3>
            <p className="text-purple-100">Comece gratuitamente e pague apenas comissão</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Preencha os dados da sua empresa</h2>

          <div className="space-y-6">
            {/* Nome da Empresa */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Building2 size={18} className="text-orange-600" />
                Nome da Empresa *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
                placeholder="Ex: Salão Beauty Hair"
              />
            </div>

            {/* Nome do Responsável */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <FileText size={18} className="text-orange-600" />
                Nome do Responsável *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Mail size={18} className="text-orange-600" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
                  placeholder="email@empresa.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Phone size={18} className="text-orange-600" />
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <MapPin size={18} className="text-orange-600" />
                Endereço Completo *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
                placeholder="Rua, número, bairro, cidade - UF"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Building2 size={18} className="text-orange-600" />
                Categoria do Negócio *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <FileText size={18} className="text-orange-600" />
                Conte mais sobre seu negócio *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-lg resize-none"
                placeholder="Descreva os principais serviços oferecidos, diferenciais, público-alvo, etc."
              />
            </div>
          </div>

          {/* Botão Submit */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={24} />
                  Enviar Solicitação
                </>
              )}
            </button>
            
            <p className="text-center text-gray-500 text-sm mt-4">
              Ao enviar, você concorda com nossos <span className="text-orange-600 font-semibold cursor-pointer">Termos de Uso</span> e <span className="text-orange-600 font-semibold cursor-pointer">Política de Privacidade</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
