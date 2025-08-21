require('dotenv').config();

const { App } = require('@slack/bolt');

// Inicia la aplicación con los tokens correctos
const app = new App({
  token: process.env.SLACK_BOT_TOKEN, // Token de OAuth (xoxb-)
  appToken: process.env.SLACK_APP_TOKEN, // App-level token (xapp-)
  socketMode: true, // Habilita Socket Mode
  logLevel: 'debug', // Para ver detalles en los logs
});

// Configura el comando /copy
app.command('/copy', async ({ command, ack, respond }) => {
  await ack(); // Reconocer el comando
  await respond({
    response_type: 'in_channel', // Respuesta visible a todos
    text: '¡Comando /copy ejecutado con éxito!',
  });
});

// Iniciar la app en Socket Mode
(async () => {
  await app.start();
  console.log('App is running in Socket Mode!');
})();

