import ChatBox from '@/components/chatbox';

export default function ChatBoxPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-5">
        <h1 className="text-3xl font-bold mb-2">
          Asistente Virtual Avícola
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">
          Obtén respuestas rápidas y apoyo inteligente para consultar, analizar y gestionar la información de tu producción avícola.
        </p>
      </header>
      <ChatBox />
    </div>
  );
}