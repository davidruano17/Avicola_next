"use client";

import { useRef, useState } from "react";
import { ImagePlus, MessageCircle, Minus, Send, X } from "lucide-react";

const chickenIcon = "/assets/images/gallina%20(1).png";
const maxImageSize = 10 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const farmDataKeys = {
  producciones: "produccionesPendientes",
  clasificaciones: "avisena_storage",
  mortalidad: "registrosMortalidad",
  morbilidad: "historialMorbilidad",
};

const initialMessages = [
  {
    role: "assistant",
    content: "Hola 👋 Soy el asistente virtual de AVISENA COL. ¿En qué puedo ayudarte hoy?",
  },
  {
    role: "assistant",
    content: "1. Informacion sobre la produccion diaria de la granja.",
  },
  {
    role: "assistant",
    content: "2. Informacion sobre la clasificacion de los huevos.",
  },
  {
    role: "assistant",
    content: "3. Informacion sobre la morbilidad y el tratamiento de las aves.",
  },
  {
    role: "assistant",
    content: "4. Informacion sobre la mortalidad de las aves.",
  },
  {
    role: "assistant",
    content: "5. Analisis y estadisticas de la granja.",
  },
];

export default function ChatBox() {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const requestController = useRef(null);
  const imageInput = useRef(null);

  const getFarmData = () => {
    return Object.fromEntries(
      Object.entries(farmDataKeys).map(([name, key]) => {
        const saved = localStorage.getItem(key);
        if (!saved) return [name, []];

        try {
          const records = JSON.parse(saved);
          return [name, Array.isArray(records) ? records.slice(-20) : []];
        } catch (error) {
          console.error(`No se pudieron leer los datos locales de ${name}:`, error);
          return [name, []];
        }
      })
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImageError("");

    if (!file) return;
    if (!acceptedImageTypes.includes(file.type)) {
      setSelectedImage(null);
      setImageError("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > maxImageSize) {
      setSelectedImage(null);
      setImageError("La imagen debe pesar 10 MB o menos.");
      return;
    }

    setSelectedImage(file);
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedImage) || loading || isEnded) return;

    const submittedImage = selectedImage;
    const userMessage = {
      role: "user",
      content: message.trim() || "Analiza la imagen adjunta.",
      imageName: submittedImage?.name,
    };
    const conversationHistory = messages.slice(-12).map(({ role, content, imageName }) => ({
      role,
      content: imageName
        ? `${content}\n[Imagen adjunta anteriormente: ${imageName}]`
        : content,
    }));

    setMessages((prev) => [...prev, userMessage]);

    setMessage("");
    setSelectedImage(null);
    setImageError("");
    setLoading(true);
    const controller = new AbortController();
    requestController.current = controller;

    try {
      const formData = new FormData();
      formData.append("message", userMessage.content);
      formData.append("history", JSON.stringify(conversationHistory));
      formData.append("farmData", JSON.stringify(getFarmData()));
      if (submittedImage) formData.append("image", submittedImage);

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `El servidor respondió con un formato inesperado (HTTP ${response.status}). Reinicia el servidor de Next.js y vuelve a intentarlo.`
        );
      }
      if (!response.ok) {
        throw new Error(data.error || "No se pudo procesar el mensaje.");
      }
      if (typeof data.response !== "string") {
        throw new Error("El asistente devolvió una respuesta vacía o inválida.");
      }
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response,
      }]);
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: error.message || "Ocurrió un error al procesar tu mensaje.",
        }]);
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setLoading(false);
      }
    }
  };

  const finishConversation = () => {
    requestController.current?.abort();
    requestController.current = null;
    setMessages([]);
    setMessage("");
    setSelectedImage(null);
    setImageError("");
    setLoading(false);
    setIsEnded(true);
    setIsMinimized(true);
  };

  const startConversation = () => {
    setMessages(initialMessages);
    setIsEnded(false);
    setIsMinimized(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white rounded-xl shadow-lg border border-slate-200">
      {isMinimized ? (
        <section className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30">
              <img src={chickenIcon} alt="" className="h-9 w-9 object-contain" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-bold text-slate-900">Asistente Avícola</h2>
            </div>
          </div>
          {isEnded ? (
            <button
              type="button"
              onClick={startConversation}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-black transition-colors hover:bg-[#3dbd14]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Nueva conversación
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              aria-label="Reabrir asistente avícola"
              title="Reabrir asistente"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-black transition-colors hover:bg-[#3dbd14]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </section>
      ) : (
        <>
          <header className="flex items-center justify-between gap-4 bg-primary p-4 text-black">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-white/50">
                <img
                  src="/assets/images/logo-sena-verde-complementario-svg-2022.svg"
                  alt="Logo SENA"
                  className="h-8 w-8 object-contain"
                />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-bold">Asistente Avícola</h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimizar asistente"
                title="Minimizar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-black transition-colors hover:bg-[#3dbd14]"
              >
                <Minus className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={finishConversation}
                aria-label="Finalizar conversación"
                title="Finalizar conversación"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-red-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="h-96 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                    <img src={chickenIcon} alt="" className="h-6 w-6 object-contain" />
                  </span>
                )}
                <span
                  className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-primary text-black"
                      : "rounded-bl-sm bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.content}
                  {msg.imageName && (
                    <span className="mt-1 block text-xs opacity-75">
                      Imagen adjunta: {msg.imageName}
                    </span>
                  )}
                </span>
              </div>
            ))}
            {loading && (
              <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
                <span className="flex h-5 w-5 items-center justify-center">
                  <img src={chickenIcon} alt="" className="h-5 w-5 object-contain" />
                </span>
                Analizando información...
              </p>
            )}
          </div>

          <form
            className="border-t border-slate-200 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            {selectedImage && (
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <span className="truncate">{selectedImage.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Quitar imagen adjunta"
                  className="shrink-0 text-red-600 hover:underline"
                >
                  Quitar
                </button>
              </div>
            )}
            {imageError && (
              <p className="mb-2 text-sm text-red-600" role="alert">{imageError}</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escribe tu pregunta..."
                aria-label="Mensaje para el asistente"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                ref={imageInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
                aria-label="Seleccionar imagen"
              />
              <button
                type="button"
                onClick={() => imageInput.current?.click()}
                disabled={loading}
                aria-label="Adjuntar imagen"
                title="Adjuntar imagen"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed"
              >
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="submit"
                disabled={loading || (!message.trim() && !selectedImage)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-black transition-colors hover:bg-[#3dbd14] disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Enviar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}