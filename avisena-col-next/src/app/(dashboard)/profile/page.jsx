'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const defaultProfiles = {
    admin: {
      name: 'Instructor Líder (Admin)',
      email: 'admin.lider@granja.com',
      role: 'Instructor Líder',
      avatar: 'https://ui-avatars.com/api/?name=Instructor+Lider&background=5be830&color=fff',
      tel: '+57 310 123 4567',
      fecha: '1985-06-15',
      sexo: 'Masculino',
      ciudad: 'Bucaramanga',
      barrio: 'Vereda La Esperanza'
    },
    aprendiz: {
      name: 'Aprendiz Sena',
      email: 'aprendiz.sena@granja.com',
      role: 'Aprendiz de Contrato',
      avatar: 'https://ui-avatars.com/api/?name=Aprendiz+Sena&background=0284c7&color=fff',
      tel: '+57 300 987 6543',
      fecha: '2001-08-20',
      sexo: 'Femenino',
      ciudad: 'Floridablanca',
      barrio: 'Barrio El Carmen'
    },
    investigador: {
      name: 'Instructor Investigador',
      email: 'investigador.sena@granja.com',
      role: 'Instructor Investigador',
      avatar: 'https://ui-avatars.com/api/?name=Instructor+Investigador&background=f59e0b&color=fff',
      tel: '+57 320 456 7890',
      fecha: '1978-11-05',
      sexo: 'Masculino',
      ciudad: 'Girón',
      barrio: 'Vereda Carrizal'
    }
  };

  const [profile, setProfile] = useState(defaultProfiles.admin);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || 'admin';
    const saved = localStorage.getItem(`user_profile_${userId}`);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setProfile(defaultProfiles[userId] || defaultProfiles.admin);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const fileInputRef = useRef(null);

  // Original Form field states
  const [formData, setFormData] = useState({ ...profile });

  // Password change states
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [mostrarAvisoExpiracion, setMostrarAvisoExpiracion] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(5);

  const cerrarSesionYRedirigir = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  const notificarExpiracionSesion = () => {
    setPasswordActual('');
    setPasswordNueva('');
    setPasswordConfirmar('');
    setPasswordError('');
    setPasswordSuccess('Contraseña actualizada con éxito. Tu sesión caducará en breve.');
    setGuardandoPassword(false);
    setMostrarAvisoExpiracion(true);
    setSegundosRestantes(5);
  };

  useEffect(() => {
    let timer;
    if (mostrarAvisoExpiracion) {
      if (segundosRestantes > 0) {
        timer = setTimeout(() => {
          setSegundosRestantes((prev) => prev - 1);
        }, 1000);
      } else {
        cerrarSesionYRedirigir();
      }
    }
    return () => clearTimeout(timer);
  }, [mostrarAvisoExpiracion, segundosRestantes]);

  useEffect(() => {
    // Keep form data in sync if profile changes
    setFormData({ ...profile });
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...profile }); // Reset form
  };

  const handleSave = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id') || 'admin';
    const updatedProfile = { ...formData };
    setProfile(updatedProfile);
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(updatedProfile));

    // Dispatch standard storage event so layout can listen
    window.dispatchEvent(new Event('storage'));

    setIsEditing(false);
    setSuccessAlert(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setSuccessAlert(false);
    }, 4000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        const updatedProfile = { ...formData, avatar: base64Url };
        setFormData(updatedProfile);

        // Auto-save the picture change to profile too
        setProfile(prev => {
          const next = { ...prev, avatar: base64Url };
          const userId = localStorage.getItem('user_id') || 'admin';
          localStorage.setItem(`user_profile_${userId}`, JSON.stringify(next));
          return next;
        });

        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const actual = passwordActual.trim();
    const nueva = passwordNueva.trim();
    const confirmar = passwordConfirmar.trim();

    if (!actual || !nueva || !confirmar) {
      setPasswordError('Por favor complete todos los campos de contraseña.');
      return;
    }

    if (nueva.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (nueva !== confirmar) {
      setPasswordError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (nueva === actual) {
      setPasswordError('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    setGuardandoPassword(true);

    const userId = localStorage.getItem('user_id') || 'admin';
    const token = localStorage.getItem('user_token');

    // 1. Intentar actualizar en el backend Django si hay token y conexión
    if (token && !token.startsWith('token-') && !token.startsWith('dummy-token')) {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/auth/cambiar-contrasena/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            password_actual: actual,
            password_nueva: nueva
          })
        });

        if (res.ok) {
          localStorage.setItem(`user_password_${userId}`, nueva);
          const usuariosGuardadosTemp = JSON.parse(localStorage.getItem('usuarios')) || [];
          const uIdx = usuariosGuardadosTemp.findIndex(
            (u) =>
              (u.email && u.email.trim().toLowerCase() === (profile.email || '').trim().toLowerCase()) ||
              String(u.id) === String(userId)
          );
          if (uIdx !== -1) {
            usuariosGuardadosTemp[uIdx].password = nueva;
            localStorage.setItem('usuarios', JSON.stringify(usuariosGuardadosTemp));
          }
          notificarExpiracionSesion();
          return;
        } else {
          const errData = await res.json().catch(() => null);
          const msg = errData?.error || 'La contraseña actual no es correcta.';
          setPasswordError(msg);
          setGuardandoPassword(false);
          return;
        }
      } catch (err) {
        // Backend no disponible, proceder con validación en almacenamiento local
      }
    }

    // 2. Validación y actualización local en localStorage
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIdx = usuariosGuardados.findIndex(
      (u) =>
        (u.email && u.email.trim().toLowerCase() === (profile.email || '').trim().toLowerCase()) ||
        String(u.id) === String(userId)
    );

    const customPassword = localStorage.getItem(`user_password_${userId}`);
    let contrasenaEsperada = customPassword;

    if (!contrasenaEsperada && usuarioIdx !== -1 && usuariosGuardados[usuarioIdx].password) {
      contrasenaEsperada = usuariosGuardados[usuarioIdx].password;
    }

    if (!contrasenaEsperada) {
      const defaults = {
        admin: ['admin', 'admin123', '123456'],
        aprendiz: ['aprendiz', 'aprendiz123', '123456'],
        investigador: ['investigador', 'investigador123', '123456']
      };
      const validDefaults = defaults[userId] || [userId, '123456'];
      if (!validDefaults.includes(actual)) {
        setPasswordError('La contraseña actual es incorrecta. Por favor verifíquela.');
        setGuardandoPassword(false);
        return;
      }
    } else {
      if (contrasenaEsperada !== actual) {
        setPasswordError('La contraseña actual es incorrecta. Por favor verifíquela.');
        setGuardandoPassword(false);
        return;
      }
    }

    // Guardar nueva contraseña en localStorage
    localStorage.setItem(`user_password_${userId}`, nueva);
    if (usuarioIdx !== -1) {
      usuariosGuardados[usuarioIdx].password = nueva;
      localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
    }

    notificarExpiracionSesion();
  };

  return (
    <main className="p-8 max-w-5xl mx-auto w-full space-y-6">
      {successAlert && (
        <aside
          id="success-alert"
          className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3 text-emerald-700 text-sm font-medium shadow-sm animate-pulse"
          role="alert"
        >
          <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
          <p>Los cambios han sido guardados exitosamente.</p>
        </aside>
      )}

      <section className="bg-white dark:bg-[#1a1f1a] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center shadow-sm">
        <figure className="relative group w-32 h-32 rounded-full border-4 border-white shadow-md bg-cover bg-center overflow-hidden">
          <picture
            id="profile-display"
            className="block w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${formData.avatar}')` }}
          ></picture>
          <input
            type="file"
            id="file-input"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 bg-[#5be830] text-white rounded-full p-1.5 border-2 border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
            aria-label="Cambiar foto de perfil"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
          </button>
        </figure>
        <h1 id="user-title-name" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
          {profile.name}
        </h1>
        <p id="user-title-role" className="text-slate-500 text-sm font-medium">
          {profile.role}
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">upload</span> Cambiar Foto
        </button>
      </section>

      <section className="bg-white dark:bg-[#1a1f1a] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <header className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/80 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Información Personal</h2>
          <span
            id="edit-badge"
            className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider transition-colors ${isEditing
                ? 'bg-emerald-50 text-[#5be830] dark:bg-emerald-950/30'
                : 'bg-slate-100 text-slate-400 dark:bg-zinc-800'
              }`}
          >
            {isEditing ? 'Modo Edición' : 'Modo Lectura'}
          </span>
        </header>

        <form id="profile-form" className="p-8" onSubmit={handleSave}>
          <fieldset disabled={!isEditing} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-nombre" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Nombre Completo
              </label>
              <input
                id="in-nombre"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              />
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-email" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Correo Electrónico
              </label>
              <input
                id="in-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              />
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-tel" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Número de Teléfono
              </label>
              <input
                id="in-tel"
                type="text"
                value={formData.tel}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              />
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-rol" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1">
                Rol <span className="material-symbols-outlined text-[14px]">lock</span>
              </label>
              <input
                id="in-rol"
                type="text"
                value={formData.role}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 p-3 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
              />
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-fecha" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Fecha de Nacimiento
              </label>
              <input
                id="in-fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              />
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-sexo" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Sexo (Opcional)
              </label>
              <select
                id="in-sexo"
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-ciudad" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Ciudad
              </label>
              <input
                id="in-ciudad"
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              />
            </p>
            <p className="flex flex-col gap-1.5 m-0">
              <label htmlFor="in-barrio" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Barrio / Vereda
              </label>
              <input
                id="in-barrio"
                type="text"
                value={formData.barrio}
                onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 text-sm focus:border-[#5be830] focus:ring-1 focus:ring-[#5be830] outline-none dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 dark:disabled:text-slate-500"
              />
            </p>
          </fieldset>

          <footer className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end items-center gap-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[#5be830] text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">save</span> Guardar Cambios
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="px-8 py-2.5 bg-emerald-50 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border-none cursor-pointer"
              >
                Editar
              </button>
            )}
          </footer>
        </form>
      </section>

      {/* Sección Seguridad y Contraseña */}
      <section className="bg-white dark:bg-[#1a1f1a] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <header className="px-8 py-5 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
          <section className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#49e619] text-2xl">shield_person</span>
            <aside>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Seguridad y Contraseña
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Para modificar tu contraseña debes ingresar primero tu contraseña actual
              </p>
            </aside>
          </section>
        </header>

        <form className="p-8 space-y-6" onSubmit={handlePasswordSubmit}>
          {passwordSuccess && (
            <aside
              className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-xs"
              role="alert"
            >
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
              <p>{passwordSuccess}</p>
            </aside>
          )}

          {passwordError && (
            <aside
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-red-700 text-sm font-semibold shadow-xs"
              role="alert"
            >
              <span className="material-symbols-outlined text-red-500 text-lg">error</span>
              <p>{passwordError}</p>
            </aside>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contraseña Actual */}
            <p className="flex flex-col gap-1.5 m-0">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Contraseña Actual *
              </label>
              <aside className="relative">
                <input
                  type={showPasswordActual ? 'text' : 'password'}
                  value={passwordActual}
                  onChange={(e) => {
                    setPasswordActual(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Tu contraseña actual"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 pr-11 text-sm focus:border-[#49e619] focus:ring-1 focus:ring-[#49e619] outline-none dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordActual(!showPasswordActual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1 border-none bg-transparent"
                  title={showPasswordActual ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <span className="material-symbols-outlined text-lg select-none">
                    {showPasswordActual ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </aside>
            </p>

            {/* Nueva Contraseña */}
            <p className="flex flex-col gap-1.5 m-0">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Nueva Contraseña *
              </label>
              <aside className="relative">
                <input
                  type={showPasswordNueva ? 'text' : 'password'}
                  value={passwordNueva}
                  onChange={(e) => {
                    setPasswordNueva(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 pr-11 text-sm focus:border-[#49e619] focus:ring-1 focus:ring-[#49e619] outline-none dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1 border-none bg-transparent"
                  title={showPasswordNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <span className="material-symbols-outlined text-lg select-none">
                    {showPasswordNueva ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </aside>
            </p>

            {/* Confirmar Nueva Contraseña */}
            <p className="flex flex-col gap-1.5 m-0">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                Confirmar Nueva Contraseña *
              </label>
              <aside className="relative">
                <input
                  type={showPasswordConfirmar ? 'text' : 'password'}
                  value={passwordConfirmar}
                  onChange={(e) => {
                    setPasswordConfirmar(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Repite la nueva contraseña"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent p-3 pr-11 text-sm focus:border-[#49e619] focus:ring-1 focus:ring-[#49e619] outline-none dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1 border-none bg-transparent"
                  title={showPasswordConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <span className="material-symbols-outlined text-lg select-none">
                    {showPasswordConfirmar ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </aside>
            </p>
          </section>

          <footer className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-400">info</span>
              La contraseña debe tener mínimo 8 caracteres y ser diferente a la actual.
            </span>
            <button
              type="submit"
              disabled={guardandoPassword}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#49E619] hover:bg-[#3dc407] disabled:opacity-60 text-black font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 border-none cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">key</span>
              <span>{guardandoPassword ? 'Actualizando...' : 'Cambiar Contraseña'}</span>
            </button>
          </footer>
        </form>
      </section>

      {/* Modal de Aviso de Caducidad de Sesión */}
      {mostrarAvisoExpiracion && (
        <section className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 p-4 flex items-center justify-center animate-in fade-in duration-200">
          <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 text-center space-y-5">
            <section className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-4xl">lock_reset</span>
            </section>

            <header className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Contraseña Actualizada
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Tu contraseña ha sido modificada con éxito. Por motivos de seguridad, <strong className="text-slate-900 dark:text-white font-bold">tu sesión caducará</strong> y debes volver a iniciar sesión con tus nuevas credenciales.
              </p>
            </header>

            <section className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">timer</span>
              <span>Redirigiendo a la pantalla de inicio de sesión en <strong className="text-sm font-bold">{segundosRestantes}</strong> segundos...</span>
            </section>

            <button
              type="button"
              onClick={cerrarSesionYRedirigir}
              className="w-full h-12 bg-[#49E619] hover:bg-[#3dc407] text-black font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Iniciar sesión ahora</span>
              <span className="material-symbols-outlined text-lg">login</span>
            </button>
          </article>
        </section>
      )}
    </main>
  );
}

