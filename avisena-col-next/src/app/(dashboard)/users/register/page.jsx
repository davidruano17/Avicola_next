'use client';

import Formregistrousuarios from '@/features/users/Formregistrousuarios';

export default function Page() {
  return (
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <main className="flex justify-center items-center py-10 px-4">
        <article className="bg-white w-full max-w-3xl rounded-3xl shadow-lg border border-slate-200 p-10">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Registro de usuarios</h1>
            <p className="text-slate-500 mt-2 text-sm">Agrega nuevos usuarios al sistema de gestión avícola.</p>
          </header>
          <Formregistrousuarios />
        </article>
      </main>
    </div>
  );
}

