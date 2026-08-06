'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Formregistrousuarios() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'aprendiz',
    tipoDocumento: 'cc',
    documento: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Usuario registrado exitosamente');
    setFormData({ nombre: '', email: '', rol: 'aprendiz', tipoDocumento: 'cc', documento: '', password: '' });
  };

  return (
    
        <section>
            <h1></h1>
            <form class="p-8 space-y-5">
                <section class="flex flex-col gap-2">
                    <label class="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">Correo electrónico</label>
                    <input class="form-input flex w-full rounded-lg text-[#111b0e] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 placeholder:text-slate-400 p-4 text-base font-normal leading-normal" placeholder="ejemplo@correo.com" type="email" />
                </section>
                <section class="flex flex-col gap-2">
                    <label class="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">Contraseña</label>
                    <section class="flex w-full items-stretch rounded-lg relative">
                        <input class="form-input flex w-full rounded-lg text-[#111b0e] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 placeholder:text-slate-400 p-4 pr-12 text-base font-normal leading-normal" placeholder="••••••••" type="password" />
                        <button class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center justify-center cursor-pointer hover:text-primary transition-colors" type="button">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                    </section>
                </section>
                <section class="flex items-center justify-between py-1">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <input class="rounded border-[#d5e7d0] dark:border-emerald-800 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                        <span class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Recordarme</span>
                    </label>
                    <a class="text-sm font-semibold text-primary hover:underline decoration-2 underline-offset-4" href="#">¿Olvidaste tu contraseña?</a>
                </section>
                <button className="w-full !bg-[#5be830] hover:!bg-[#4cc528] text-black font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] mt-2" type="submit">
                    Iniciar Sesión
                </button>
                <section class="relative flex items-center py-4">
                    <section class="flex-grow border-t border-[#eaf3e7] dark:border-emerald-900/30"></section>
                    <span class="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">o continuar con</span>
                    <section class="flex-grow border-t border-[#eaf3e7] dark:border-emerald-900/30"></section>
                </section>
                <section class="grid grid-cols-2 gap-4">
                    <button class="flex items-center justify-center gap-2 border border-[#d5e7d0] dark:border-emerald-900/50 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark transition-colors" type="button">
                        <img alt="" class="w-5 h-5" data-alt="Logotipo de Google G" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_d5hYyO4z3g3vFGaOWt2gKWxLbkoR7yGR-FIJY0tY5DwfwsZzg926IklnwkQzF_oZVKUGPZ5oVrj_VTbTy1mOF5n9g2Igyl3Sab5aN2HTDHiiAW2kQxIcXARNx5XRNWe83js0niz61mf8MabWER510FffmSQiTmMMEv7gpxCJWES-5Skdy7HZj0f4CzwCtwC6grNH0g--ENZW6rYTp1yZ59BEoz4w8Hx4BH1lP63uCIV40vouPnzM389oAYfyE5sU9boaUW1XiG5g" />
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
                    </button>
                    <button class="flex items-center justify-center gap-2 border border-[#d5e7d0] dark:border-emerald-900/50 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark transition-colors" type="button">
                        <svg class="w-5 h-5 text-[#1877F2]" fill="currentColor" viewbox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
                    </button>
                </section>
            </form>
        </section>
    );
}
