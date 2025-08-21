require('dotenv').config(); // Cargar las variables de entorno
const { App } = require('@slack/bolt');

// Importar funciones de otros archivos
const { appHome, appHomeSuccess } = require('./AppHome');
const { copyModal } = require('./copyModal');
const { feedbackModal } = require('./feedbackModal');

// Inicia la aplicación con los tokens correctos
const app = new App({
  token: process.env.SLACK_BOT_TOKEN, // Token de OAuth (xoxb-)
  appToken: process.env.SLACK_APP_TOKEN, // App-level token (xapp-)
  socketMode: true, // Habilita Socket Mode
  logLevel: 'debug', // Esto ayudará a mostrar los errores detallados en los logs
});

// Manejo del comando `/copy`
app.command('/copy', async ({ command, ack, respond }) => {
  console.log('Comando /copy recibido:', command); // Imprimir detalles del comando

  // Responder con botones interactivos para abrir el modal
  const message = {
    text: '¿Quieres aprobar o rechazar esta copia?',
    attachments: [
      {
        text: 'Selecciona una opción:',
        fallback: 'No tienes un cliente de Slack compatible con acciones',
        callback_id: 'copy_review',
        actions: [
          {
            name: 'approve',
            text: 'Aprobar',
            type: 'button',
            value: 'approve',
          },
          {
            name: 'reject',
            text: 'Rechazar',
            type: 'button',
            value: 'reject',
          },
        ],
      },
    ],
  };

  await ack(); // Responder a Slack inmediatamente
  await respond(message); // Enviar el mensaje con los botones interactivos
});

// Manejo de la acción de aprobar
app.action('approve', async ({ body, ack, respond }) => {
  await ack(); // Acknowledge the action
  await respond({
    response_type: 'in_channel',
    text: `¡Aprobada! La copia fue aprobada por ${body.user.name}.`,
  });

  // Abrir el modal para dejar feedback
  const modal = feedbackModal(body.channel.id, body.message.thread_ts);
  await app.client.views.open({
    trigger_id: body.trigger_id,
    view: modal,
  });
});

// Manejo de la acción de rechazar
app.action('reject', async ({ body, ack, respond }) => {
  await ack(); // Acknowledge the action
  await respond({
    response_type: 'in_channel',
    text: `¡Rechazada! La copia fue rechazada por ${body.user.name}.`,
  });

  // Abrir el modal para dejar feedback
  const modal = feedbackModal(body.channel.id, body.message.thread_ts);
  await app.client.views.open({
    trigger_id: body.trigger_id,
    view: modal,
  });
});

// Manejo del evento cuando se abre la "home tab" de la app
app.event('app_home_opened', async ({ event, client, ack }) => {
  // Responde cuando se abre la home tab
  try {
    const view = appHome(client);
    await client.views.publish({
      user_id: event.user,
      view: view,
    });
  } catch (error) {
    console.error(error);
  }
  await ack();
});

// Manejo de la acción para abrir el modal "Post New Copy"
app.action('post_copy_open_modal', async ({ body, ack, respond }) => {
  await ack(); // Acknowledge the action

  const channel_id = body.channel.id;
  const modal = copyModal(channel_id);
  
  // Abrir el modal "Post New Copy"
  await app.client.views.open({
    trigger_id: body.trigger_id,
    view: modal,
  });
});

// Iniciar la aplicación en Socket Mode
(async () => {
  await app.start();
  console.log('App is running in Socket Mode!');
})();