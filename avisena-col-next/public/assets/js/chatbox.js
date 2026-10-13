async function obtenerProduccionHoy() {

  const resultado = await db.query(`
    SELECT SUM(cantidad) AS total
    FROM produccion_huevos
    WHERE DATE(fecha) = CURDATE()
  `);

  return resultado[0].total;

}
const totalProduccion = await obtenerProduccionHoy();

const prompt = `
El usuario preguntó:

${message}

Información real del sistema:

Producción de huevos de hoy:
${totalProduccion} huevos.

Responde de forma clara y sencilla.
`;
const response = await ollama.chat({

  model: "llama3.2",

  messages: [

    {
      role: "system",

      content: `
Eres un asistente especializado
en gestión avícola.
      `,
    },

    {
      role: "user",

      content: prompt,
    },

  ],

});