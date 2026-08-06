'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function Page() {
  const [step, setStep] = useState(1);

  // Step 1 State
  const [email, setEmail] = useState('');
  const [errorMsg1, setErrorMsg1] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Step 2 State
  const [code, setCode] = useState('');
  const [errorMsg2, setErrorMsg2] = useState(false);

  // Step 3 State
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const router = useRouter();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.includes('@')) {
      setErrorMsg1(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setStep(2);
        setSuccessMsg(false);
      }, 1500);
    } else {
      setErrorMsg1(true);
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      setErrorMsg2(false);
      setStep(3);
    } else {
      setErrorMsg2(true);
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (newPass === confirmPass && newPass.length >= 8) {
      alert('¡Contraseña cambiada exitosamente!');
      router.push('/login');
    } else {
      alert('Las contraseñas no coinciden o no cumplen los requisitos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-['Inter'] relative p-4">
      {/* Header General */}
      {step === 1 && (
        <>
          <img src="/assets/images/logo-sena-verde-complementario-svg-2022.svg" alt="Logo SENA" className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full " />
          <Link href="/" className="absolute bottom-8 left-10 bg-[#5be830] hover:bg-[#4dd325] text-black font-bold px-10 py-2 rounded-full shadow-md transition-all active:scale-95 z-10">SALIR</Link>
        </>
      )}

      {(step === 2 || step === 3) && (
        <>
          <header className="fixed top-6 left-8 flex items-center gap-3 z-10">
            <img src="/assets/images/logo-sena-verde-complementario-svg-2022.svg" alt="Logo SENA" className="w-14 h-14 object-contain" />
            <h2 className="text-[#043224] font-extrabold text-2xl uppercase tracking-wider">AVISENA COL</h2>
          </header>
          <Link href="/" className="fixed bottom-8 left-8 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-10 py-3 rounded-full shadow-xl transition-all z-10">SALIR</Link>
        </>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <section className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-xl px-10 py-10 text-center border border-slate-200">
          <h1 className="text-slate-900 text-2xl font-extrabold">Recuperación <br /> de contraseña</h1>
          <p className="text-slate-500 text-sm mt-4 leading-relaxed">
            Por favor ingresa el correo electrónico <br /> que tienes registrado en el aplicativo.
          </p>

          <form className="mt-7 flex flex-col gap-4" onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electronico"
              className="w-full h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#5be830] focus:outline-none px-4"
              required
            />
            <button type="submit" className="w-32 mx-auto bg-[#5be830] hover:bg-[#4dd325] text-black font-bold py-2 rounded-full shadow-md transition-all active:scale-95">
              ENVIAR
            </button>

            {errorMsg1 && <p className="text-red-500 font-semibold text-sm mt-2">Ingresa un correo válido.</p>}
            {successMsg && <p className="text-green-600 font-semibold text-sm mt-2">Código enviado correctamente al correo.</p>}
          </form>

          <article className="mt-7 flex items-start gap-3 text-left">
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png" className="w-5 h-5 mt-1" alt="icono info" />
            <p className="text-slate-500 text-sm leading-snug">
              Se enviará un código a tu correo electrónico, para cambiar la contraseña.
            </p>
          </article>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <main className="bg-white w-full max-w-md rounded-[1rem] px-10 py-16 shadow-2xl text-center">
          <h1 className="text-black text-4xl font-extrabold leading-tight">Recuperación <br /> de contraseña</h1>
          <p className="text-black/80 mt-6 text-base leading-relaxed">
            Por favor ingresa el código de 6 dígitos enviado al correo electrónico que tienes registrado en el aplicativo.
          </p>

          <form className="mt-10 space-y-8" onSubmit={handleCodeSubmit}>
            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código"
              className="text-black text-center text-lg py-5 rounded-2xl bg-gray-50 placeholder:text-black/50 tracking-[0.5em] focus:ring-2 focus:ring-green-400 outline-none border border-gray-200 shadow-inner w-full"
            />
            {errorMsg2 && <span className="block text-red-500 text-sm font-medium">Debes ingresar un código válido de 6 dígitos</span>}
            <button type="submit" className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-4 text-lg rounded-full w-full transition-all transform hover:scale-105 shadow-lg">
              ENVIAR
            </button>
          </form>
        </main>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <main className="bg-white w-full max-w-md rounded-[1rem] px-10 py-16 shadow-2xl text-center">
          <h1 className="text-black text-4xl font-extrabold leading-tight">Restablecer <br /> contraseña</h1>

          <form className="mt-12 space-y-6" onSubmit={handleResetSubmit}>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Contraseña nueva"
              required
              className="w-full bg-gray-50 border border-gray-200 text-black text-center text-lg py-5 rounded-2xl placeholder:text-black/50 focus:ring-2 focus:ring-green-400 outline-none shadow-inner"
            />

            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirmación de contraseña"
              required
              className="w-full bg-gray-50 border border-gray-200 text-black text-center text-lg py-5 rounded-2xl placeholder:text-black/50 focus:ring-2 focus:ring-green-400 outline-none shadow-inner"
            />

            <button type="submit" className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-4 text-lg rounded-full w-full mt-4 transition-all transform hover:scale-105 shadow-lg">
              CONFIRMAR CAMBIO
            </button>
          </form>
        </main>
      )}
    </div>
  );
}
