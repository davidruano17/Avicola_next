"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeaderInicioSesion from '@/components/Header';
import FooterInicioSesion from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/services/api';

export default function Forminiciosesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // Si el usuario se devuelve al login sin cerrar sesión:
  // 1. Invalida la sesión previa (limpiando tokens para evitar reingresos no autenticados)
  // 2. Trunca y bloquea el historial hacia adelante con pushState, deshabilitando la flecha siguiente del navegador
  useEffect(() => {
    const invalidarSesionYBloquearAdelante = () => {
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');

      if (typeof window !== 'undefined') {
        // Al sobreescribir el estado actual, el navegador descarta y desactiva la flecha adelante
        window.history.pushState(null, '', window.location.href);
      }
    };

    invalidarSesionYBloquearAdelante();

    // Capturar si el usuario se devuelve con la flecha atrás vía memoria caché (bfcache) o popstate
    window.addEventListener('pageshow', invalidarSesionYBloquearAdelante);
    window.addEventListener('popstate', invalidarSesionYBloquearAdelante);

    return () => {
      window.removeEventListener('pageshow', invalidarSesionYBloquearAdelante);
      window.removeEventListener('popstate', invalidarSesionYBloquearAdelante);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Por favor ingrese su correo electrónico y contraseña.');
      setError(true);
      setTimeout(() => setError(false), 5000);
      return;
    }

    setCargando(true);

    // 1. Intentar autenticar contra el backend API (Django REST Framework)
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_token', data.access || 'dummy-token');
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

        let roleId = 'admin';
        const rolStr = (data.usuario?.rol || '').toLowerCase();
        if (rolStr.includes('aprendiz')) {
          roleId = 'aprendiz';
        } else if (rolStr.includes('investigador')) {
          roleId = 'investigador';
        }

        localStorage.setItem('user_id', roleId);
        localStorage.setItem(`user_profile_${roleId}`, JSON.stringify({
          name: data.usuario?.nombre || 'Usuario',
          email: data.usuario?.email || trimmedEmail,
          role: data.usuario?.rol || 'Instructor Líder',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.usuario?.nombre || 'Usuario')}&background=49e619&color=000`
        }));

        router.push('/dashboard');
        return;
      } else {
        // El backend respondió con código de error (400, 401, etc.)
        const errData = await res.json().catch(() => null);
        const backendMsg =
          errData?.non_field_errors?.[0] ||
          errData?.detail ||
          errData?.identificador?.[0] ||
          errData?.password?.[0] ||
          errData?.error ||
          'Credenciales de acceso incorrectas. Verifique correo y contraseña.';

        setErrorMessage(backendMsg);
        setError(true);
        setCargando(false);
        setTimeout(() => setError(false), 5000);
        return; // ¡IMPORTANTE! Si el backend está disponible y rechazó las credenciales, NUNCA permitir el acceso.
      }
    } catch (apiErr) {
      console.warn("Fallo de conexión con el backend, verificando credenciales locales de contingencia:", apiErr);
    }

    // 2. Modo contingencia (offline / servidor no disponible):
    // Validar estrictamente contraseñas predeterminadas para los roles demo
    const emailLower = trimmedEmail.toLowerCase();
    const contrasenasDemo = {
      admin: 'admin123',
      'admin@avisena.com': 'admin123',
      aprendiz: 'aprendiz123',
      'aprendiz@avisena.com': 'aprendiz123',
      investigador: 'investigador123',
      'investigador@avisena.com': 'investigador123',
    };

    if (contrasenasDemo[emailLower] !== undefined) {
      if (trimmedPassword !== contrasenasDemo[emailLower]) {
        setCargando(false);
        setErrorMessage('Credenciales de acceso incorrectas. Verifique correo y contraseña.');
        setError(true);
        setTimeout(() => setError(false), 5000);
        return;
      }

      let roleId = 'admin';
      if (emailLower.includes('aprendiz')) roleId = 'aprendiz';
      else if (emailLower.includes('investigador')) roleId = 'investigador';

      localStorage.setItem('user_token', 'token-' + roleId);
      localStorage.setItem('user_id', roleId);
      router.push('/dashboard');
      return;
    }

    // 3. Autenticación con usuarios registrados localmente (localStorage)
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioEncontrado = usuariosGuardados.find(
      (u) =>
        (u.email && u.email.trim().toLowerCase() === emailLower) ||
        (u.documento && String(u.documento).trim() === emailLower)
    );

    if (usuarioEncontrado) {
      if (usuarioEncontrado.estado && usuarioEncontrado.estado.toUpperCase() === 'INACTIVO') {
        setCargando(false);
        setErrorMessage('Esta cuenta de usuario se encuentra inactiva.');
        setError(true);
        setTimeout(() => setError(false), 5000);
        return;
      }

      // Validar contraseña requerida de forma estricta
      if (!usuarioEncontrado.password || usuarioEncontrado.password !== trimmedPassword) {
        setCargando(false);
        setErrorMessage('Credenciales de acceso incorrectas. Verifique correo y contraseña.');
        setError(true);
        setTimeout(() => setError(false), 5000);
        return;
      }

      let roleId = 'admin';
      const rolStr = (usuarioEncontrado.rol || '').toLowerCase();
      if (rolStr.includes('aprendiz')) {
        roleId = 'aprendiz';
      } else if (rolStr.includes('investigador')) {
        roleId = 'investigador';
      }

      localStorage.setItem('user_token', 'token-' + (usuarioEncontrado.id || Date.now()));
      localStorage.setItem('user_id', roleId);
      localStorage.setItem(`user_profile_${roleId}`, JSON.stringify({
        name: usuarioEncontrado.nombre,
        email: usuarioEncontrado.email,
        role: usuarioEncontrado.rol,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioEncontrado.nombre)}&background=49e619&color=000`
      }));

      router.push('/dashboard');
      return;
    }

    setCargando(false);
    setErrorMessage('Credenciales de acceso incorrectas. Verifique correo y contraseña.');
    setError(true);
    setTimeout(() => setError(false), 5000);
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
                {errorMessage || "Usuario o contraseña no reconocidos."}
              </section>
            )}

            <section className="flex flex-col gap-2">
              <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">
                Correo electrónico
              </label>
              <input
                type="text"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo electrónico"
                required
                className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-11 sm:h-12 p-3 sm:p-4 text-base transition-all"
              />
            </section>

            <section className="flex flex-col gap-2">
              <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">
                Contraseña
              </label>
              <section className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 p-4 pr-12 text-base transition-all"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </section>
            </section>

            <button
              type="submit"
              disabled={cargando}
              className="flex items-center justify-center w-full bg-[#49E619] hover:bg-[#3dc407] disabled:opacity-70 text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mb-5 uppercase tracking-wide cursor-pointer"
            >
              {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <section className="text-center text-sm text-slate-500 dark:text-slate-400">
              <Link href="/forgot-password" className="text-[#49e619] font-bold hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </section>
          </form>
        </article>
      </main>

      <section className="h-[8vh] min-h-[64px] flex-shrink-0">
        <FooterInicioSesion />
      </section>
    </section>
  );
}
