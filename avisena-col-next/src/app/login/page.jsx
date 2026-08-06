import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeaderInicioSesion from '../../layouts/Header';
import FooterInicioSesion from '../../layouts/Footer';
import Forminiciosesion from '../../features/users/Forminiciosesion';


export default function LoginView() {
    return (
        <div className=" bg-background-light dark:bg-background-dark font-display text-[#111b0e] dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300">
            <section className="h-[8vh] min-h-[64px] flex-shrink-0">
                <HeaderInicioSesion />
            </section>

            <main className="flex-1 min-h-0 flex items-center justify-center px-3 sm:px-4 py-2 overflow-hidden">
                <Forminiciosesion />
            </main>


            <section className="h-[8vh] min-h-[56px] flex-shrink-0">
                <FooterInicioSesion />
            </section>
        </div>
        
    );
}
    