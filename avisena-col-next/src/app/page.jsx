'use client';

import Link from 'next/link';
const logoSena = '/assets/images/logo-sena-verde-complementario-svg-2022.svg';
const gallinaBaner = '/assets/images/gallina_baner.jpg';
const iconoproduccion = '/assets/images/icons8-grafico-combinado-50.png';
const iconoclasificacion = '/assets/images/icons8-test-fallido-50.png';
const iconomortalidad = '/assets/images/icons8-corazon-con-pulso-50.png';
const iconomorbilidad = '/assets/images/icons8-alimentando-pollo-50.png';
const iconocorreo = '/assets/images/correo.png';
const iconocompartir = '/assets/images/compartir.png';
const iconoglobal = '/assets/images/internet.png';



export default function Page() {
  return (
  <>
      <section>
      </section>
      <section className="bg-background-light dark:bg-background-dark font-display transition-colors duration-300">
        <section className="relative flex h-5px  !w-full flex-col group/design-root overflow-x-hidden">
          <section className=" flex  grow flex-col">
           <header
  className="
    fixed top-0 left-0 w-full z-50
    bg-white/80 backdrop-blur-md
    border-b border-green-100
  "
>

  <section
    className="
      max-w-[1800px]
      mx-auto
      px-8 py-5
      flex
      items-center
      justify-between
    "
  >

    {/* LOGO IZQUIERDA */}
    <section className="flex items-center gap-4">

      <img
        src={logoSena}
        alt="logo"
        className="w-14 h-14"
      />

      <h3 className="text-2xl font-black !text-black">
        AVISENA COL
      </h3>

    </section>

    {/* NAV CENTRO */}
    <nav
      className="
        hidden md:flex
        items-center
        gap-10
        absolute
        left-1/2
        -translate-x-1/2
      "
    >

      <a
        href="#blog"
        className="
          !text-black
          font-semibold
          hover:text-lime-500
          transition-colors
        "
      >
        Blog de artículos
      </a>

      <a
        href="#acerca"
        className="
          !text-black
          font-semibold
          hover:text-lime-500
          transition-colors
        "
      >
        Acerca de nosotros
      </a>

      <a
        href="#contacto"
        className="
          !text-black
          font-semibold
          hover:text-lime-500
          transition-colors
        "
      >
        Contáctanos
      </a>

    </nav>

    {/* BOTONES DERECHA */}
    <section className="flex items-center gap-5">

      

      <Link
        href="/login"
        className="
          bg-[#49e619]
          hover:bg-[#3cd110]  shadow-[0_15px_30px_rgba(73,230,25,0.4)] transition-all transform hover:scale-110 active:scale-95 
          !text-black
          !font-extrabold
          px-6 py-3
          rounded-3xl
          
          
        "
      >
        Iniciar sesión
      </Link>

    </section>

  </section>

</header>
            <main className=" mt-20 flex flex-1 flex-col">
              <section className="px-4 md:px-20 py-8">
                <section className=" w-full">
                  <section className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <section className="flex h-120 w-full flex-col bg-cover bg-center bg-no-repeat items-center justify-center p-6 text-center bg-[#2c1d16]" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${gallinaBaner})` }}>
                      <article className="max-w-3xl bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                        <h2 className="text-white text-5xl md:text-6xl font-black leading-tight">
                          ¡Bienvenido!
                        </h2>
                        <p className="text-white text-lg md:text-xl font-medium mt-6">
                          Controla tu producción de huevos de forma eficiente.<br className="hidden md:block" />
                          Gestiona tus lotes y monitorea la salud de tus aves.<br className="hidden md:block" />
                          ¡Tu éxito avícola a un toque de distancia!
                        </p>
                      </article>
                    </section>
                  </section>
                </section>
              </section>
              <section className="px-4 md:px-20 py-16 bg-white dark:bg-black/20">
                <section className="w-full mx-auto">
                  <section className="flex flex-col gap-12 @container">
                    <article className="flex flex-col gap-4 text-center items-center">
                      <h2 className="text-emerald-950 dark:text-emerald-50 tracking-tight text-3xl font-black  md:text-5xl max-w-[1000px]">
                        Todo lo que necesitas para tu galpón
                      </h2>
                      <p className="text-emerald-800 dark:text-emerald-200 text-lg font-normal leading-normal max-w-[720px]">
                        Nuestras herramientas digitales están diseñadas para mejorar la eficiencia operativa y el control total de tu producción desde la palma de tu mano.
                      </p>
                    </article>
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  
  {/* Tarjeta 1: Control de Producción */}
  <article className=" w-full flex flex-col items-center text-center gap-4 bg-white dark:bg-background-dark/40 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 border-b-[6px] border-b-[#49e619] shadow-sm transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-2xl hover:border-b-[#3cd110]">
    <section className="w-20 h-20 rounded-2xl bg-[#49e619]/20 flex items-center justify-center">
      <img src={iconoproduccion} alt="Control de Producción" className="w-12 h-12 object-contain" />
    </section>
    <section className="flex flex-col gap-2">
      <h2 className="text-[#004d40] dark:text-emerald-50 text-xl font-extrabold leading-tight">
        Control de Producción
      </h2>
      <p className="text-[#00695c] dark:text-emerald-300 text-sm font-medium leading-relaxed">
        Registra y controla la producción diaria de huevos de forma rápida y organizada.
      </p>
    </section>
  </article>

  {/* Tarjeta 2: Clasificación */}
  <article className="flex flex-col items-center text-center gap-4 bg-white dark:bg-background-dark/40 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 border-b-[6px] border-b-[#49e619] shadow-sm transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-2xl hover:border-b-[#3cd110]">
    <section className="w-20 h-20 rounded-2xl bg-[#49e619]/20 flex items-center justify-center">
      <img src={iconoclasificacion} alt="Clasificación" className="w-12 h-12 object-contain" />
    </section>
    <section className="flex flex-col gap-2">
      <h2 className="text-[#004d40] dark:text-emerald-50 text-xl font-extrabold leading-tight">
        Clasificación
      </h2>
      <p className="text-[#00695c] dark:text-emerald-300 text-sm font-medium leading-relaxed">
        Clasifica los huevos por tamaño, calidad y tipo para mejorar la gestión.
      </p>
    </section>
  </article>

  {/* Tarjeta 3: Mortalidad */}
  <article className="flex flex-col items-center text-center gap-4 bg-white dark:bg-background-dark/40 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 border-b-[6px] border-b-[#49e619] shadow-sm transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-2xl hover:border-b-[#3cd110]">
    <section className="w-20 h-20 rounded-2xl bg-[#49e619]/20 flex items-center justify-center">
      <img src={iconomortalidad} alt="Mortalidad" className="w-12 h-12 object-contain" />
    </section>
    <section className="flex flex-col gap-2">
      <h2 className="text-[#004d40] dark:text-emerald-50 text-xl font-extrabold leading-tight">
        Mortalidad
      </h2>
      <p className="text-[#00695c] dark:text-emerald-300 text-sm font-medium leading-relaxed">
        Lleva el control de aves fallecidas para análisis y toma de decisiones oportunas.
      </p>
    </section>
  </article>

  {/* Tarjeta 4: Morbilidad */}
  <article className="flex flex-col items-center text-center gap-4 bg-white dark:bg-background-dark/40 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 border-b-[6px] border-b-[#49e619] shadow-sm transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-2xl hover:border-b-[#3cd110]">
    <section className="w-20 h-20 rounded-2xl bg-[#49e619]/20 flex items-center justify-center">
      <img src={iconomorbilidad} alt="Morbilidad" className="w-12 h-12 object-contain" />
    </section>
    <section className="flex flex-col gap-2">
      <h2 className="text-[#004d40] dark:text-emerald-50 text-xl font-extrabold leading-tight">
        Morbilidad
      </h2>
      <p className="text-[#00695c] dark:text-emerald-300 text-sm font-medium leading-relaxed">
        Registra enfermedades y síntomas del lote.
      </p>
    </section>
  </article>

</section>
                  </section>
                </section>
              </section>
              <section className="px-4 md:px-20 py-16">
                <section className="!w-full mx-auto bg-emerald-900 dark:bg-emerald-950 rounded-[2rem] overflow-hidden relative">
                  <aside className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl"></aside>
                  <aside className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-20 -mb-20 blur-3xl"></aside>
                  <section className="flex flex-col items-center gap-8 px-6 py-16 md:py-24 relative z-10">
                    <article className="flex flex-col gap-4 text-center max-w-[720px]">
                      <h2 className="text-white tracking-tight text-3xl font-black leading-tight md:text-5xl">
                        ¿Listo para digitalizar tu granja?
                      </h2>
                      <p className="text-emerald-100/80 text-lg font-normal leading-relaxed">
                        Únete a cientos de productores que ya están optimizando sus resultados y aumentando su producción con tecnología de punta.
                      </p>
                    </article>
                    <a href="https://play.google.com/store/apps" target="_blank" className="bg-[#49e619] hover:bg-[#3cd110] text-[#0b3303] !text-black !font-extrabold px-12 py-5 rounded-2xl shadow-[0_15px_30px_rgba(73,230,25,0.4)] transition-all transform hover:scale-110 active:scale-95 flex items-center gap-3">
                      <span className="material-symbols-outlined"></span>
                      Comenzar Ahora
                    </a>
                  </section>
                </section>
              </section>
            </main>
            <footer className="bg-background-light dark:bg-background-dark border-t border-emerald-100 dark:border-emerald-900">
              <section className="w-full mx-auto flex flex-col gap-10 px-6 md:px-20 py-12 text-center">
                <section className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <section className="flex items-center gap-3 text-emerald-900 dark:text-emerald-50">
                    <img src={logoSena} alt="Logo SENA" className="w-12 h-12" />
                    <h2 className="text-xl font-black">AVISENA COL</h2>
                  </section>
                  <nav className="flex flex-wrap items-center justify-center gap-8">
                    <a className="!text-black dark:text-emerald-400 text-sm font-medium hover:text-primary transition-colors" href="#">Términos de Servicio</a>
                    <a className="!text-black dark:text-emerald-400 text-sm font-medium hover:text-primary transition-colors" href="#">Privacidad</a>
                    <a className="!text-black dark:text-emerald-400 text-sm font-medium hover:text-primary transition-colors" href="#">Soporte</a>
                  </nav>
                  <aside id="contactanos" className="flex flex-wrap justify-center gap-5">
                    <a className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 hover:bg-primary hover:text-emerald-950 transition-all" href="#"><span className="material-symbols-outlined text-xl"><img src={iconocorreo} alt="correo" /></span></a>
                    <a className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 hover:bg-primary hover:text-emerald-950 transition-all" href="#"><span className="material-symbols-outlined text-xl"><img src={iconocompartir} alt="compartir" /></span></a>
                    <a className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 hover:bg-primary hover:text-emerald-950 transition-all" href="#"><span className="material-symbols-outlined text-xl"><img src={iconoglobal} alt="global" /> </span></a>
                  </aside>
                </section>
                <section>
                  <p className="text-emerald-700 dark:text-emerald-500  font-medium">
                    © 2026 AVISENA COL. Innovación sostenible para la industria avícola.
                    
                  </p>
                </section>
              </section>
            </footer>
          </section>
        </section>
      </section>
    </>
  );
}
