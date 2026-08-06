'use client';

import React, { useState, useEffect } from 'react';

const Page = () => {
  const defaultSettings = {
    theme: 'light',
    language: 'es',
    rememberSession: true,
    desktopNotifications: false,
    autoSave: true
  };

  // Settings State
  const [theme, setThemeState] = useState(defaultSettings.theme);
  const [language, setLanguage] = useState(defaultSettings.language);
  const [rememberSession, setRememberSession] = useState(defaultSettings.rememberSession);
  const [desktopNotifications, setDesktopNotifications] = useState(defaultSettings.desktopNotifications);
  const [autoSave, setAutoSave] = useState(defaultSettings.autoSave);

  // Saved settings ref/state to allow Canceling changes
  const [savedSettings, setSavedSettings] = useState(defaultSettings);

  // Load saved settings from localStorage una vez montado en el cliente
  useEffect(() => {
    const saved = localStorage.getItem('avisena_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeState(parsed.theme);
        setLanguage(parsed.language);
        setRememberSession(parsed.rememberSession);
        setDesktopNotifications(parsed.desktopNotifications);
        setAutoSave(parsed.autoSave);
        setSavedSettings(parsed);
      } catch (e) {
        console.error('Error parsing saved settings', e);
      }
    }
  }, []);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Update HTML class for theme live preview
  const applyTheme = (currentTheme) => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (currentTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      // Auto theme - check system media query
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  };

  // Sync theme preview immediately when theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Clean up theme class when component unmounts if they didn't save?
  // Let's just keep the theme persistent.

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSave = () => {
    const settingsToSave = {
      theme,
      language,
      rememberSession,
      desktopNotifications,
      autoSave
    };
    localStorage.setItem('avisena_settings', JSON.stringify(settingsToSave));
    setSavedSettings(settingsToSave);
    showToast('¡Configuración guardada con éxito!', 'success');
  };

  const handleCancel = () => {
    setThemeState(savedSettings.theme);
    setLanguage(savedSettings.language);
    setRememberSession(savedSettings.rememberSession);
    setDesktopNotifications(savedSettings.desktopNotifications);
    setAutoSave(savedSettings.autoSave);
    applyTheme(savedSettings.theme);
    showToast('Cambios revertidos', 'info');
  };

  return (
    <div className="bg-surface font-body-md text-on-surface overflow-x-hidden transition-colors duration-200">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white transition-all duration-300 ${
          toast.type === 'success' ? 'bg-[#1B7A0A]' : 
          toast.type === 'warning' ? 'bg-error' : 'bg-secondary'
        }`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 
             toast.type === 'warning' ? 'report' : 'info'}
          </span>
          <span className="font-label-md text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto px-4 md:px-6 lg:px-10 py-6 pb-24">
        <div className="mb-8">
          <h3 className="font-headline-xl text-headline-xl text-on-surface">Configuración</h3>
          <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">Administra las preferencias básicas y el entorno visual de tu panel de control.</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm shadow-surface/40 transition-colors">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">palette</span>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Apariencia</h4>
                  <p className="text-label-sm text-on-surface-variant">Elige el aspecto de la aplicación.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div
                onClick={() => setThemeState('light')}
                className={`cursor-pointer rounded-3xl border px-4 py-4 transition-all duration-200 ${
                  theme === 'light'
                    ? 'border-primary bg-white shadow-sm'
                    : 'border-outline-variant bg-surface'
                } hover:shadow-lg`}
              >
                <div className="rounded-3xl border border-outline-variant bg-surface-container p-4 mb-4">
                  <div className="h-16 rounded-2xl bg-white" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface">Tema Claro</span>
                  <span className={`material-symbols-outlined text-primary ${theme === 'light' ? 'opacity-100' : 'opacity-0'} transition-opacity`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>

              <div
                onClick={() => setThemeState('dark')}
                className={`cursor-pointer rounded-3xl border px-4 py-4 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-primary bg-inverse-surface shadow-sm'
                    : 'border-outline-variant bg-surface'
                } hover:shadow-lg`}
              >
                <div className="rounded-3xl border border-outline-variant bg-on-surface-variant p-4 mb-4">
                  <div className="h-16 rounded-2xl bg-[#161b2c]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface">Tema Oscuro</span>
                  <span className={`material-symbols-outlined text-primary ${theme === 'dark' ? 'opacity-100' : 'opacity-0'} transition-opacity`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>

              <div
                onClick={() => setThemeState('auto')}
                className={`cursor-pointer rounded-3xl border px-4 py-4 transition-all duration-200 ${
                  theme === 'auto'
                    ? 'border-primary bg-gradient-to-br from-white to-inverse-surface shadow-sm'
                    : 'border-outline-variant bg-surface'
                } hover:shadow-lg`}
              >
                <div className="rounded-3xl border border-outline-variant bg-surface p-4 mb-4 grid grid-cols-2 gap-2">
                  <div className="h-16 rounded-2xl bg-white" />
                  <div className="h-16 rounded-2xl bg-on-surface-variant" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface">Automático</span>
                  <span className={`material-symbols-outlined text-primary ${theme === 'auto' ? 'opacity-100' : 'opacity-0'} transition-opacity`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(520px,1fr)]">
            <section className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-6 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">language</span>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Idioma</h4>
                </div>
              </div>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-outline-variant bg-white px-4 py-3 text-on-surface shadow-sm outline-none transition duration-200 focus:border-secondary-fixed-dim focus:ring-2 focus:ring-secondary-fixed-dim/20"
                >
                  <option value="es">Español (Castellano)</option>
                  <option value="en">English (US)</option>
                  <option value="pt">Português (Brasil)</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  expand_more
                </span>
              </div>
              <p className="mt-3 text-label-sm text-on-surface-variant">Selecciona el idioma principal para la interfaz.</p>
            </section>

            <section className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-6 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">settings_suggest</span>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Sistema</h4>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  {
                    label: 'Recordar sesión',
                    checked: rememberSession,
                    onChange: (value) => setRememberSession(value)
                  },
                  {
                    label: 'Notificaciones de escritorio',
                    checked: desktopNotifications,
                    onChange: (value) => setDesktopNotifications(value)
                  },
                  {
                    label: 'Auto-guardado',
                    checked: autoSave,
                    onChange: (value) => setAutoSave(value)
                  }
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between gap-4">
                    <span className="text-body-md font-medium text-on-surface">{toggle.label}</span>
                    <button
                      type="button"
                      onClick={() => toggle.onChange(!toggle.checked)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${toggle.checked ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <span
                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${toggle.checked ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              className="w-full rounded-2xl border border-outline bg-white px-6 py-3 text-on-surface-variant font-semibold transition hover:bg-surface-container-low"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              className="w-full rounded-2xl bg-primary px-6 py-3 text-on-primary font-semibold transition hover:bg-primary/90"
              onClick={handleSave}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
