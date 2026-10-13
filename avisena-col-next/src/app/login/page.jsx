"use client";

import { useState } from 'react';
import Link from 'next/link';
import HeaderInicioSesion from '@/components/Header';
import FooterInicioSesion from '@/components/Footer';
import { useRouter } from 'next/navigation';



export default function Forminiciosesion() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'admin' || email === 'aprendiz' || email === 'investigador') {
            localStorage.setItem('user_token', 'dummy-token');
            localStorage.setItem('user_id', email);
            router.push('/dashboard');
        } else {
            setError(true);
            setTimeout(() => setError(false), 5000);
        }
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

  return (
    <section className="min-h-screen h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[#071205]">
      <section className="h-[8vh] min-h-[64px] flex-shrink-0">
        <HeaderInicioSesion />
      </section>

      <main className="flex-1 min-h-0 flex items-center justify-center px-3 sm:px-4 py-2 overflow-hidden">
        <article className="w-full max-w-[360px] sm:max-w-[420px] bg-white dark:bg-[#1c2e17] rounded-2xl shadow-2xl border border-[#eaf3e7] dark:border-emerald-900/30 overflow-hidden flex flex-col max-h-[calc(100vh-20vh)] sm:max-h-[calc(100vh-20vh)]">
          <header className="pt-3 sm:pt-4 px-4 sm:px-6 text-center">
            <h1 className="text-[#111b0e] dark:text-white text-2xl sm:text-3xl font-black">
              Bienvenido
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2">
              Gestiona las actividades de tu unidad avicola en {" "}
              <span className="text-[#49e619] font-bold">AVISENA COL</span>.
            </p>
          </header>

          <form onSubmit={handleLogin} className="p-3 sm:p-6 space-y-2 sm:space-y-4 overflow-y-auto">
            {error && (
              <section className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-bold" role="alert">
                Usuario no reconocido. Usa admin, aprendiz o investigador.
              </section>
            )}

            <section className="flex flex-col gap-2">
              <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">
                Correo electrónico
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo electronico"
                className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-11 sm:h-12 p-3 sm:p-4 text-base transition-all"
              />
            </section>

            <section className="flex flex-col gap-2">
              <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">Contraseña</label>
              <aside className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 p-4 pr-12 text-base transition-all"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary text-xl"
                >
                  <span className="material-symbols-outlined text-base select-none">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </aside>
            </section>

            <button
              type="submit"
              className="flex items-center justify-center w-full bg-[#49E619] hover:bg-[#3dc407] text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mb-5 uppercase tracking-wide cursor-pointer"
            >
              Iniciar sesión
            </button>

            <section className="text-center text-sm text-slate-500 dark:text-slate-400">
              <section className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="rounded border-[#d5e7d0] dark:border-emerald-800 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Recordarme</span>
                </label>
                <Link className="text-sm font-semibold text-[#49e619] hover:underline decoration-2 underline-offset-4" href="/forgot-password">¿Olvidaste tu contraseña?</Link>
              </section>
            </section>
          </form>
        </article>
      </main>

      <section className="h-[8vh] min-h-[56px] flex-shrink-0">
        <FooterInicioSesion />
      </section>
    </section>
  );
}
