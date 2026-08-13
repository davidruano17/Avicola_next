'use client';

import { useState } from 'react';
import HeaderInicioSesion from '@/components/Header';
import FooterInicioSesion from '@/components/Footer';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = {};
    if (!email) newErrors.email = 'El email es requerido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    if (email && !email.includes('@')) newErrors.email = 'Email inválido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    console.log('Iniciando sesión con:', { email, password });

    setTimeout(() => {
      alert('Inicio de sesión exitoso (simulado)');
      setLoading(false);
    }, 1000);
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

          <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-2 sm:space-y-4 overflow-y-auto">
            {errors.general && (
              <section className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-bold" role="alert">
                {errors.general}
              </section>
            )}

            <section className="flex flex-col gap-2">
              <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">
                Correo electrónico o Usuario
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin / aprendiz / investigador"
                className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-11 sm:h-12 p-3 sm:p-4 text-base transition-all"
              />
              {errors.email && <span className="text-sm text-red-600">{errors.email}</span>}
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
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary text-xl"
                >
                  <span className="material-symbols-outlined text-base select-none">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </aside>
              {errors.password && <span className="text-sm text-red-600">{errors.password}</span>}
            </section>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full bg-[#49E619] hover:bg-[#3dc407] text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mb-5 uppercase tracking-wide cursor-pointer"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>

            <section className="relative flex items-center py-2">
              <section className="flex-grow border-t border-[#eaf3e7] dark:border-emerald-900/30"></section>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">continuar con</span>
              <section className="flex-grow border-t border-[#eaf3e7] dark:border-emerald-900/30"></section>
            </section>

           <section className="grid grid-cols-2 gap-4">

              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-[#d5e7d0] dark:border-emerald-900/50 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark transition-colors"
              >
                <img
                  alt="Google"
                  className="w-5 h-5"
                  src="/assets/images/google.png"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Google
                </span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-[#d5e7d0] dark:border-emerald-900/50 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark transition-colors"
              >
                <img
                  alt="Facebook"
                  className="w-5 h-5"
                  src="/assets/images/facebook.png"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Facebook
                </span>
              </button>
            </section>
            <section className="text-center text-sm text-slate-500 dark:text-slate-400">
              <section className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="rounded border-[#d5e7d0] dark:border-emerald-800 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Recordarme</span>
                </label>
                <a className="text-sm font-semibold text-[#49e619] hover:underline decoration-2 underline-offset-4" href="#">¿Olvidaste tu contraseña?</a>
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
