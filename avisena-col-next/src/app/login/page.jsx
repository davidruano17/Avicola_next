'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
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
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

    return (
        <div className=" bg-background-light dark:bg-background-dark font-display text-[#111b0e] dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300">
            <header className=" flex items-center justify-between border-b border-solid border-[#eaf3e7] dark:border-emerald-900/30 px-6 py-4 md:px-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
                <section className="flex items-center gap-3">
                    <img
                        src="/assets/images/logo-sena-verde-complementario-svg-2022.svg"
                        alt="Logo SENA"
                        className="w-12 h-12 object-contain"
                    />
                    <h2 className="text-[#111b0e] dark:text-slate-100 text-xl font-black uppercase tracking-tight">
                        AVISENA COL
                    </h2>
                </section>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2 hidden md:block">
                    Sistema de Gestión Avícola
                </p>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <article className="w-full max-w-[460px] bg-white dark:bg-[#1c2e17] rounded-2xl shadow-2xl border border-[#eaf3e7] dark:border-emerald-900/30 overflow-hidden">
                    <header className="pt-10 px-8 text-center">
                        <h1 className="text-[#111b0e] dark:text-white text-3xl font-black">
                            Bienvenido
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                            Gestiona tu producción en <span className="text-[#49e619] font-bold">AVISENA COL</span>.
                        </p>
                    </header>

                    <form id="loginForm" className="p-8 flex flex-col" onSubmit={handleLogin}>
                        {error && (
                            <div
                                id="errorBox"
                                className="mb-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-bold transition-all"
                                role="alert"
                            >
                                Usuario o contraseña incorrectos.
                            </div>
                        )}

                        <section className="flex flex-col gap-2 mb-5">
                            <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">
                                Correo electrónico o Usuario
                            </label>
                            <input
                                type="text"
                                id="email"
                                placeholder="admin / aprendiz / investigador"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 p-4 text-base transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </section>

                        <section className="flex flex-col gap-2 mb-6">
                            <label className="text-[#111b0e] dark:text-slate-200 text-sm font-semibold">
                                Contraseña
                            </label>
                            <aside className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 p-4 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    onClick={togglePassword}
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 text-xl focus:outline-none cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base select-none">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                                </button>
                            </aside>
                        </section>

                        <button
                            type="submit"
                            className="flex items-center justify-center w-full bg-primary hover:bg-[#3dbd14] text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mb-5 uppercase tracking-wide cursor-pointer"
                        >
                            Iniciar Sesión
                        </button>

                    <section className="flex items-center py-4 md:py-7">
                                        <hr className="flex-grow border-t border-[#eaf3e7] dark:border-emerald-900/30" />
                                        <span className="mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">o</span>
                                        <hr className="flex-grow border-t border-[#eaf3e7] dark:border-emerald-900/30 " />
                    </section>
                        <section className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                id="btnGoogle"
                                className="flex items-center justify-center gap-2 border border-[#d5e7d0] dark:border-emerald-900/50 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-background-dark transition-all font-bold text-sm cursor-pointer"
                            >
                                <img
                                    className="w-4 h-4"
                                    src="/assets/images/google-logo-search-new-svgrepo-com.svg"
                                    alt="Google"
                                />
                                Google
                            </button>

                            <button
                                type="button"
                                id="btnFacebook"
                                className="flex items-center justify-center gap-2 border border-[#d5e7d0] dark:border-emerald-900/50 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-background-dark transition-all font-bold text-sm cursor-pointer"
                            >
                                <img
                                    className="w-4 h-4"
                                    src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                                    alt="Facebook"
                                />
                                Facebook
                            </button>
                        </section>
                    </form>

                    <footer className="bg-slate-50 dark:bg-black/20 border-t border-[#eaf3e7] dark:border-emerald-900/30 py-6 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            <Link
                                href="/forgot-password"
                                className="text-[#49e619] font-black hover:underline underline-offset-4 ml-1"
                            >
                                ¿olvidaste tu contraseña?
                            </Link>
                        </p>
                    </footer>
                </article>
            </main>

            <footer className="py-8 px-6 text-center border-t border-emerald-100 dark:border-emerald-900/20 mt-auto">
                <p className="text-slate-400 text-xs font-medium">
                    © 2026 AVISENA COL - SENA. Innovación y Sostenibilidad Avícola.
                </p>
            </footer>
        </div>
    );
}