'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import HeaderInicioSesion from '@/components/Header';
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Pasos: 1 = Email, 2 = Código OTP, 3 = Nueva Contraseña, 4 = Éxito
  const [step, setStep] = useState(1);

  // Datos del formulario
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [codigoDemo, setCodigoDemo] = useState(null);

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Estados de interfaz y feedback
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [countdownRedirect, setCountdownRedirect] = useState(5);

  // Temporizador para el cooldown de reenvío de código
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Temporizador para redirección automática al completar el paso 4
  useEffect(() => {
    if (step !== 4) return;
    if (countdownRedirect <= 0) {
      router.push('/login');
      return;
    }
    const timer = setInterval(() => {
      setCountdownRedirect((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdownRedirect, router]);

  // -------------------------------------------------------------
  // PASO 1: Solicitar código OTP al correo
  // -------------------------------------------------------------
  const handleSolicitarCodigo = async (e) => {
    e?.preventDefault();
    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio || !emailLimpio.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setError(null);
    setCargando(true);

    try {
      const res = await api.post('auth/recuperar-password/solicitar/', {
        email: emailLimpio,
      });

      if (res?.codigo_demo) {
        setCodigoDemo(res.codigo_demo);
      }

      setMensajeExito(
        res?.mensaje ||
          `Hemos enviado un código de 6 dígitos a ${emailLimpio}.`
      );
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      setError(
        err?.message ||
          'No fue posible enviar el código. Verifica el correo e intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  // -------------------------------------------------------------
  // REENVIAR CÓDIGO (desde el paso 2)
  // -------------------------------------------------------------
  const handleReenviarCodigo = async () => {
    if (resendCooldown > 0 || cargando) return;
    setError(null);
    setCargando(true);

    try {
      const res = await api.post('auth/recuperar-password/solicitar/', {
        email: email.trim().toLowerCase(),
      });

      if (res?.codigo_demo) {
        setCodigoDemo(res.codigo_demo);
      }

      setMensajeExito('Se ha reenviado un nuevo código a tu correo.');
      setResendCooldown(60);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setError(err?.message || 'No se pudo reenviar el código.');
    } finally {
      setCargando(false);
    }
  };

  // -------------------------------------------------------------
  // PASO 2: Verificar el código OTP de 6 dígitos
  // -------------------------------------------------------------
  const handleVerificarCodigo = async (e) => {
    e?.preventDefault();
    const codigoLimpio = code.trim();

    if (codigoLimpio.length !== 6) {
      setError('El código debe contener exactamente 6 dígitos.');
      return;
    }

    setError(null);
    setCargando(true);

    try {
      const res = await api.post('auth/recuperar-password/verificar/', {
        email: email.trim().toLowerCase(),
        codigo: codigoLimpio,
      });

      if (res?.reset_token) {
        setResetToken(res.reset_token);
      }

      setMensajeExito(null);
      setStep(3);
    } catch (err) {
      setError(
        err?.message ||
          'El código ingresado no es válido o ha caducado. Intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  // -------------------------------------------------------------
  // PASO 3: Restablecer contraseña en MySQL
  // -------------------------------------------------------------
  const handleRestablecerPassword = async (e) => {
    e?.preventDefault();

    if (newPass.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setError(null);
    setCargando(true);

    try {
      await api.post('auth/recuperar-password/restablecer/', {
        email: email.trim().toLowerCase(),
        codigo: code.trim(),
        reset_token: resetToken,
        password_nueva: newPass,
        password_confirmar: confirmPass,
      });

      setStep(4);
    } catch (err) {
      setError(
        err?.message ||
          'Ocurrió un error al restablecer la contraseña. Inicia el proceso nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#071205] font-['Inter'] selection:bg-emerald-500 selection:text-white">
      {/* Encabezado Institucional */}
      <HeaderInicioSesion />

      {/* Contenido Principal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#162512] rounded-3xl shadow-xl border border-slate-200/80 dark:border-emerald-900/40 p-6 sm:p-8 relative overflow-hidden transition-all">
          {/* Barra superior de pasos */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1
                    ? 'bg-[#22c55e] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                1
              </span>
              <div
                className={`w-6 h-0.5 rounded transition-all ${
                  step >= 2 ? 'bg-[#22c55e]' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2
                    ? 'bg-[#22c55e] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                2
              </span>
              <div
                className={`w-6 h-0.5 rounded transition-all ${
                  step >= 3 ? 'bg-[#22c55e]' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 3
                    ? 'bg-[#22c55e] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                3
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {step === 1 && 'Paso 1: Correo'}
              {step === 2 && 'Paso 2: Código OTP'}
              {step === 3 && 'Paso 3: Nueva Clave'}
              {step === 4 && 'Completado'}
            </span>
          </div>

          {/* Banner de error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Banner de éxito temporal */}
          {mensajeExito && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1">{mensajeExito}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASO 1: Ingreso de correo electrónico                   */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                  <Mail className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Recuperar Contraseña
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Ingresa el correo electrónico registrado en{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    AVISENA COL
                  </span>{' '}
                  para recibir tu código de seguridad.
                </p>
              </div>

              <form onSubmit={handleSolicitarCodigo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@misena.edu.co"
                      required
                      disabled={cargando}
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-emerald-900/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando || !email.trim()}
                  className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {cargando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Enviando código...
                    </>
                  ) : (
                    'Enviar Código'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASO 2: Verificación de Código OTP                      */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Verificar Código
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Ingresa el código de 6 dígitos que enviamos a:
                </p>
                <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 underline hover:opacity-80"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              {/* Atajo rápido en modo desarrollo */}
              {codigoDemo && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold">Modo Desarrollo:</span> Código OTP generado:{' '}
                    <span className="font-mono font-bold tracking-widest">{codigoDemo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCode(codigoDemo)}
                    className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 text-amber-900 dark:text-amber-100 font-bold rounded text-[11px] cursor-pointer"
                  >
                    Rellenar
                  </button>
                </div>
              )}

              <form onSubmit={handleVerificarCodigo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 text-center">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    placeholder="------"
                    autoFocus
                    required
                    disabled={cargando}
                    className="w-full h-14 text-center text-2xl font-mono font-black tracking-[0.5em] rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-emerald-900/40 text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-1.5">
                    El código tiene una validez de 15 minutos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={cargando || code.trim().length !== 6}
                  className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {cargando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Validando código...
                    </>
                  ) : (
                    'Verificar Código'
                  )}
                </button>
              </form>

              {/* Botón de reenvío con temporizador */}
              <div className="mt-5 text-center">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ¿No te llegó el correo? Podrás reenviarlo en{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {resendCooldown}s
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleReenviarCodigo}
                    disabled={cargando}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reenviar nuevo código
                  </button>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al paso anterior
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASO 3: Ingreso y confirmación de nueva contraseña      */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Nueva Contraseña
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Crea una contraseña segura para tu cuenta en{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    AVISENA COL
                  </span>
                  .
                </p>
              </div>

              <form onSubmit={handleRestablecerPassword} className="space-y-4">
                {/* Contraseña Nueva */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      disabled={cargando}
                      className="w-full h-12 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-emerald-900/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPass ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      disabled={cargando}
                      className="w-full h-12 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-emerald-900/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPass ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Requisitos visuales */}
                <div className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl space-y-1.5 border border-slate-100 dark:border-emerald-900/30 text-xs">
                  <div
                    className={`flex items-center gap-2 ${
                      newPass.length >= 8
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        newPass.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    Al menos 8 caracteres de longitud
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      confirmPass && newPass === confirmPass
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        confirmPass && newPass === confirmPass
                          ? 'bg-emerald-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    Ambas contraseñas coinciden exactamente
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    cargando ||
                    newPass.length < 8 ||
                    newPass !== confirmPass
                  }
                  className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {cargando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Guardando contraseña...
                    </>
                  ) : (
                    'Guardar Contraseña'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASO 4: Confirmación y Redirección Exitosa              */}
          {/* ======================================================== */}
          {step === 4 && (
            <div className="text-center py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                ¡Contraseña Actualizada!
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                Tu contraseña ha sido restablecida y cifrada con éxito en la
                base de datos. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  Iniciar Sesión Ahora
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                Redirigiendo automáticamente en{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {countdownRedirect}s
                </span>
                ...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}