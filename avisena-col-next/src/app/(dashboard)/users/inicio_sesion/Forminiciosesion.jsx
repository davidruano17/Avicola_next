import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Forminiciosesion() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'admin' || email === 'aprendiz' || email === 'investigador') {
            localStorage.setItem('user_token', 'dummy-token');
            localStorage.setItem('user_id', email);
            navigate('/dashboard');
        } else {
            setError(true);
            setTimeout(() => setError(false), 5000);
        }
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <article className="w-full max-w-[360px] sm:max-w-[420px] bg-white dark:bg-[#1c2e17] rounded-2xl shadow-2xl border border-[#eaf3e7] dark:border-emerald-900/30 overflow-hidden flex flex-col max-h-[calc(100vh-20vh)]">
            <header className="pt-3 sm:pt-4 px-4 sm:px-6 text-center">
                <h1 className="text-[#111b0e] dark:text-white text-2xl sm:text-3xl font-black">
                    Bienvenido
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2">
                    Gestiona las actividades de tu unidad avicola en {" "}
                    <span className="text-[#49e619] font-bold">AVISENA COL</span>.
                </p>
            </header>

            <form onSubmit={handleLogin} className="p-3 sm:p-6 space-y-2 sm:space-y-4 overflow-y-auto flex-1">
                {error && (
                    <section className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-bold" role="alert">
                        Usuario o contraseña incorrectos.
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
                        required
                        className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-11 sm:h-12 p-3 sm:p-4 text-base transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            required
                            className="w-full rounded-lg text-[#111b0e] dark:text-white border border-[#d5e7d0] dark:border-emerald-900/50 bg-[#f9fcf8] dark:bg-background-dark/50 h-12 p-4 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary text-xl"
                        >
                            {showPassword ? 'visibility' : 'visibility_off'}
                        </button>
                    </aside>
                </section>

                <button
                    type="submit"
                    className="flex items-center justify-center w-full bg-[#49E619] hover:bg-[#3dc407] text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mb-5 uppercase tracking-wide cursor-pointer"
                >
                    Iniciar Sesión
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

                <section className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                    <div className="flex items-center justify-between py-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input className="rounded border-[#d5e7d0] dark:border-emerald-800 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Recordarme</span>
                        </label>
                        <Link to="/forgot-password" className="text-sm font-semibold text-[#49e619] hover:underline decoration-2 underline-offset-4">¿Olvidaste tu contraseña?</Link>
                    </div>
                </section>
            </form>
        </article>
    );
}