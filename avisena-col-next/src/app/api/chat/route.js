import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
});

const maxImageSize = 10 * 1024 * 1024;
const maxHistoryMessages = 12;
const maxHistoryMessageLength = 4000;
const maxFarmDataLength = 50000;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const farmDataKeys = ["producciones", "clasificaciones", "mortalidad", "morbilidad"];

export const runtime = "nodejs";

function parseJsonField(value, fieldName, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`El campo ${fieldName} no contiene JSON válido.`);
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const model = process.env.OLLAMA_MODEL || "qwen2.5vl:7b";
    let message = "";
    let image;
    let history = [];
    let farmData = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const submittedMessage = formData.get("message");
      const submittedImage = formData.get("image");
      const submittedHistory = formData.get("history");
      const submittedFarmData = formData.get("farmData");

      if (typeof submittedMessage === "string") {
        message = submittedMessage.trim();
      }
      if (typeof submittedHistory === "string") {
        history = parseJsonField(submittedHistory, "history", []);
      }
      if (typeof submittedFarmData === "string") {
        farmData = parseJsonField(submittedFarmData, "farmData", {});
      }

      if (submittedImage && typeof submittedImage !== "string") {
        if (!acceptedImageTypes.includes(submittedImage.type)) {
          return Response.json(
            { error: "El formato de imagen debe ser JPG, PNG o WebP." },
            { status: 415 }
          );
        }
        if (submittedImage.size === 0 || submittedImage.size > maxImageSize) {
          return Response.json(
            { error: "La imagen debe tener contenido y pesar 10 MB o menos." },
            { status: 413 }
          );
        }

        image = Buffer.from(await submittedImage.arrayBuffer()).toString("base64");
      }
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      if (typeof body.message === "string") {
        message = body.message.trim();
      }
      history = body.history || [];
      farmData = body.farmData || {};
    } else {
      return Response.json(
        { error: "El tipo de contenido de la solicitud no es compatible." },
        { status: 415 }
      );
    }

    if (
      !Array.isArray(history) ||
      history.some(
        (item) =>
          !item ||
          !["user", "assistant"].includes(item.role) ||
          typeof item.content !== "string"
      )
    ) {
      return Response.json(
        { error: "El historial de la conversación no es válido." },
        { status: 400 }
      );
    }
    if (
      !farmData ||
      typeof farmData !== "object" ||
      Array.isArray(farmData) ||
      JSON.stringify(farmData).length > maxFarmDataLength
    ) {
      return Response.json(
        { error: "Los datos de la granja enviados no son válidos o son demasiado grandes." },
        { status: 413 }
      );
    }
    farmData = Object.fromEntries(
      farmDataKeys.map((key) => [
        key,
        Array.isArray(farmData[key]) ? farmData[key].slice(-20) : [],
      ])
    );

    if (!message && !image) {
      return Response.json(
        { error: "Escribe una pregunta o adjunta una imagen." },
        { status: 400 }
      );
    }

    const previousMessages = history.slice(-maxHistoryMessages).map((item) => ({
      role: item.role,
      content: item.content.slice(0, maxHistoryMessageLength),
    }));
    const userMessage = {
      role: "user",
      content: message || "Analiza la imagen adjunta y descríbela en español.",
      ...(image ? { images: [image] } : {}),
    };

    const response = await ollama.chat({
      model,
      messages: [
        {
          role: "system",
          content: `
Eres el asistente conversacional de AVISENA COL. Responde siempre en español, con claridad y naturalidad, teniendo en cuenta todo el historial de esta conversación.
Si el mensaje actual es solamente un número, interprétalo según el menú mostrado en la conversación: 1 producción diaria, 2 clasificación de huevos, 3 morbilidad y tratamientos, 4 mortalidad, 5 análisis y estadísticas.
Para responder preguntas sobre registros de la granja, utiliza únicamente los datos locales incluidos abajo. Si no hay datos relevantes, dilo claramente; no inventes cifras ni afirmes tener acceso a información en tiempo real. Los registros pueden estar limitados a los 20 más recientes por categoría.
También puedes resolver preguntas generales y analizar imágenes de cualquier tema. En imágenes, describe solo lo que se ve y, si contienen texto o ejercicios, transcríbelos y resuélvelos cuando sea posible. Aclara cualquier limitación.

Datos locales disponibles de la granja (JSON):
${JSON.stringify(farmData)}
          `,
        },
        ...previousMessages,
        userMessage,
      ],
    });

    return Response.json({ response: response.message.content });
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error?.message?.startsWith("El campo ")
    ) {
      return Response.json(
        { error: error.message || "La solicitud contiene JSON no válido." },
        { status: 400 }
      );
    }

    console.error("Error al comunicarse con Ollama:", error);
    const errorMessage =
      error?.message || "";
    const modelName = process.env.OLLAMA_MODEL || "qwen2.5vl:7b";

    return Response.json(
      {
        error:
          errorMessage.includes("not found")
            ? `El modelo "${modelName}" no está instalado en Ollama. Instálalo con: ollama pull ${modelName}`
            : "No se pudo procesar el mensaje. Verifica que Ollama esté activo, que el modelo configurado esté instalado y que admita imágenes.",
      },
      { status: 500 }
    );
  }
}
