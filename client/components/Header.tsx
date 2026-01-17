'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, clearAuth } from '@/lib/auth';
import { Calendar } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { user } = getAuth();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold hover:opacity-90 transition">
            <Calendar className="w-8 h-8" />
            <span>AgentGatto</span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-purple-200 transition">
                  Dashboard
                </Link>
                <Link href="/agendamentos" className="hover:text-purple-200 transition">
                  Agendamentos
                </Link>
                <span className="text-purple-200">Olá, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-purple-200 transition">
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
