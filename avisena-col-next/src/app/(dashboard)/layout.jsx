'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  ClipboardList,
  ChevronDown,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

const logoSena = '/assets/images/logo-sena-verde-complementario-svg-2022.svg';

// Réplica ligera de <NavLink> de react-router-dom usando next/link + usePathname
function NavLink({ to, className, children }) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  return (
    <Link href={to} className={resolvedClassName}>
      {children}
    </Link>
  );
}

const userMap = {
  admin: {
    name: 'Instructor Líder (Admin)',
    email: 'admin.lider@granja.com',
    role: 'Instructor Líder',
    avatar: 'https://ui-avatars.com/api/?name=Instructor+Lider&background=5be830&color=fff'
  },
  aprendiz: {
    name: 'Aprendiz Sena',
    email: 'aprendiz.sena@granja.com',
    role: 'Aprendiz de Contrato',
    avatar: 'https://ui-avatars.com/api/?name=Aprendiz+Sena&background=0284c7&color=fff'
  },
  investigador: {
    name: 'Instructor Investigador',
    email: 'investigador.sena@granja.com',
    role: 'Instructor Investigador',
    avatar: 'https://ui-avatars.com/api/?name=Instructor+Investigador&background=f59e0b&color=fff'
  }
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Se activa recién montado en el cliente: evita leer localStorage durante el
  // render en servidor (Next pre-renderiza los Client Components en el server).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isUsersActive = [
    '/prodfunfinal',
    '/registro_clasificacion',
    '/mortalidad',
    '/morbilidad'
  ].includes(pathname);

  const pageTitles = {
    '/users': 'Gestión de Usuarios',
    '/prodfunfinal': 'Producción Diaria',
    '/registro_clasificacion': 'Clasificación de Huevos',
    '/mortalidad': 'Mortalidad',
    '/reportes': 'Reportes',
    '/morbilidad': 'Morbilidad',
    '/rep_diario': 'Reporte Producción Diaria',
    '/rep_alimento': 'Reporte Consumo de Alimento',
    '/rep_mortalidad': 'Reporte Mortalidad',
    '/rep_finanzas': 'Reporte Finanzas',
    '/profile': 'Mi Perfil',
    '/notificaciones': 'Notificaciones',
    '/configuracion': 'Configuración',
    '/lotes': 'Administrar lotes',
    '/dashboard': 'Inicio',
    '/finanzas': 'Finanzas',
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(userMap.admin);

  // userId/role solo se calculan de verdad una vez montado en el cliente;
  // antes de eso usan el mismo valor por defecto que en el servidor.
  const userId = mounted ? (localStorage.getItem('user_id') || 'admin') : 'admin';
  const role = userId;

  const config = () => {
    setIsProfileMenuOpen(false);
    router.push('/configuracion');
  };

  // Si no hay usuario logueado, redirige a login de inmediato
  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const toggleDropdown = (menu) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      return;
    }

    setOpenDropdown(
      openDropdown === menu ? null : menu
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  useEffect(() => {
    const updateProfile = () => {
      const saved = localStorage.getItem(`user_profile_${userId}`);
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setCurrentUser(userMap[userId] || userMap.admin);
    };

    updateProfile();
    window.addEventListener('storage', updateProfile);
    return () => {
      window.removeEventListener('storage', updateProfile);
    };
  }, [userId]);

  return (
    <section className="flex h-screen w-full overflow-hidden bg-[#f6f8f6] dark:bg-[#070a14] text-slate-900 dark:text-[#eff1f5] font-sans">
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-[#0d121e] border-r border-slate-200 dark:border-[#1c2a44] flex flex-col justify-between shrink-0 relative shadow-sm z-40 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group/sidebar ${isSidebarCollapsed ? 'w-20' : 'w-[260px]'}`}>
        <section className="flex flex-col gap-8 p-4 overflow-y-auto overflow-x-hidden">
          <button onClick={toggleSidebar} className="absolute -right-4 top-6 w-8 h-8 bg-white dark:bg-[#0d121e] border border-slate-200 dark:border-[#1c2a44] rounded-full shadow flex items-center justify-center z-[100] transition-transform duration-200 cursor-pointer hover:scale-110">
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          <header className={`flex items-center gap-3 px-2 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <figure className="p-2 bg-[#5be830]/10 dark:bg-[#5be830]/20 rounded-xl shrink-0">
              <img
                src={logoSena}
                alt="SENA"
                className="w-8 h-8"
              />
            </figure>
            <hgroup className={`transition-opacity duration-200 brand-text-group ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              <h1 className="text-xl font-black uppercase leading-none whitespace-nowrap">AVISENA</h1>
              <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-tighter">{currentUser.role}</p>
            </hgroup>
          </header>

          <nav className="flex flex-col gap-1">
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}`}>
              <Users className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Inicio</span>
            </NavLink>

            {role === "admin" && (
            <NavLink to="/users" className={({ isActive }) => `flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}`}>
              <Users className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Gestión de Usuarios</span>
            </NavLink>
            )}
            <NavLink to="/lotes" className={({ isActive }) => `flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}`}>
              <Users className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Administrar lotes</span>
            </NavLink>

            <section className="dropdown-container">
              <button
                type="button"
                onClick={() => toggleDropdown('registros')}
                className={`flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline bg-transparent border-none ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isUsersActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}`}
              >
                <ClipboardList className={`w-5 h-5 shrink-0 `} />
                <span className={`flex-1 text-left transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Registros</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${openDropdown === 'registros' ? 'rotate-180' : ''} ${isSidebarCollapsed ? 'hidden' : 'block'}`} />
              </button>
              {openDropdown === 'registros' && !isSidebarCollapsed && (
                <nav className="flex flex-col gap-2 py-2 pl-13">
                  <Link href="/prodfunfinal" className="text-[12px] font-medium text-[#64748b] dark:text-[#becbb3] text-left no-underline transition-colors duration-200 hover:text-primary">Producción Diaria</Link>
                  <Link href="/registro_clasificacion" className="text-[12px] font-medium text-[#64748b] dark:text-[#becbb3] text-left no-underline transition-colors duration-200 hover:text-primary">Clasificación Huevos</Link>
                  <Link href="/mortalidad" className="text-[12px] font-medium text-[#64748b] dark:text-[#becbb3] text-left no-underline transition-colors duration-200 hover:text-primary">Mortalidad</Link>
                  <Link href="/morbilidad" className="text-[12px] font-medium text-[#64748b] dark:text-[#becbb3] text-left no-underline transition-colors duration-200 hover:text-primary">Morbilidad</Link>
                  <Link href="/tratamiento" className="text-[12px] font-medium text-[#64748b] dark:text-[#becbb3] text-left no-underline transition-colors duration-200 hover:text-primary">Tratamiento</Link>
                </nav>

              )}
            </section>
            <NavLink to="/reportes" className={({ isActive }) => `flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}`}>
              <FileText className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Reportes</span>
            </NavLink>
            {role === "admin" && (
            <NavLink to="/finanzas" className={({ isActive }) => `flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}`}>
              <FileText className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Finanzas</span>
            </NavLink>
            )}

            <NavLink to="/notificaciones" className={({ isActive }) => `flex items-center h-12 rounded-lg text-slate-600 dark:text-[#becbb3] hover:bg-[#f1f5f9] dark:hover:bg-[#162035] hover:text-slate-900 dark:hover:text-white transition-all duration-200 w-full cursor-pointer box-border no-underline ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} ${isActive ? 'bg-[#f1f5f9] dark:bg-[#162035] text-[#49e619] dark:text-white' : ''}` }>
              <Bell className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Notificaciones</span>
            </NavLink>
          </nav>
        </section>
        <footer className="sidebar-footer">
          {/* Footer content if any */}
        </footer>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f6f8f6] dark:bg-[#070a14] overflow-hidden">
        <header className="flex items-center justify-between py-4 px-8 bg-white dark:bg-[#0d121e] border-b border-slate-200 dark:border-[#1c2a44] sticky top-0 z-30 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#eff1f5]">{pageTitles[pathname] || 'Dashboard'}</h2>
          <article className="user-meta relative">
            <section className="user-details flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 m-0 leading-tight user-name-display">
                  {currentUser.name}
                </p>
                <p className="text-xs text-primary font-medium m-0 flex items-center justify-end gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary block"></span> Online
                </p>
              </div>
              <section className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  }}
                  className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all p-0 border-none bg-transparent"
                >
                  <p
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-primary hover:opacity-80 transition-opacity user-avatar-img"
                    style={{ backgroundImage: `url("${currentUser.avatar}")` }}
                  ></p>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1a1f1a] rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-[100] transform origin-top-right transition-all">
                    <header className="p-6 bg-slate-50 dark:bg-zinc-800/50 flex items-center gap-4 border-b border-slate-100 dark:border-zinc-800">
                      <img
                        src={currentUser.avatar}
                        alt={`Foto de ${currentUser.name}`}
                        className="w-16 h-16 rounded-full border-2 border-primary shadow-sm user-avatar-img"
                      />
                      <hgroup className="text-left">
                        <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 m-0 user-name-display">
                          {currentUser.name}
                        </h1>
                        <p className="text-xs text-slate-500 m-0 mt-0.5 user-email-display">
                          {currentUser.email}
                        </p>
                      </hgroup>
                    </header>

                    <nav aria-label="Menú de cuenta" className="p-3 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                          <section>
                            <strong className="block text-sm text-slate-800 dark:text-slate-200 font-bold">Mi Perfil</strong>
                            <span className="block text-[11px] text-slate-500">Datos personales y granja</span>
                          </section>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </Link>

                      <button
                        onClick={config}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                          </div>
                          <section>
                            <strong className="block text-sm text-slate-800 dark:text-slate-200 font-bold">Configuración</strong>
                            <span className="block text-[11px] text-slate-500">Preferencias de cuenta</span>
                          </section>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-zinc-800 my-2 mx-3"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group text-left border-none bg-transparent"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <LogOut className="w-5 h-5 ml-1" />
                        </div>
                        <strong className="block text-sm text-red-600 font-bold">Cerrar Sesión</strong>
                      </button>
                    </nav>
                  </div>
                )}
              </section>
            </section>
          </article>
        </header>

        {/* MAIN VIEW FOR ROUTING */}
        <section id="main-view" className="flex-1 overflow-y-auto p-8 animate-[fadeIn_0.3s_ease-in-out]">
          {children}
          <footer className="mt-2 py-8 border-t border-slate-200 dark:border-slate-800 text-center">
            <section className="flex flex-col items-center gap-4">
              <section className="flex items-center gap-6 opacity-60">
                <section className="flex flex-col items-center">
                  <span className="text-xs">Sistema de Gestión Avicola</span>
                </section>
              </section>
              <p className="text-[11px] text-slate-500">© 2026 AVISENA COL</p>
            </section>
          </footer>
        </section>
      </main>
    </section>
  );
}
