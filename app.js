const { App } = require('@slack/bolt');
const db = require('better-sqlite3')('./database/database.db');
const { copyModal } = require('./views/copyModal');
const { feedbackModal } = require('./views/feedbackModal');
const { appHome, appHomeSuccess } = require('./views/appHome');
require('dotenv').config();

db.prepare("CREATE TABLE IF NOT EXISTS items (name TEXT)").run();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Comando `/copy` para abrir el modal de "Post New Copy"
app.command('/copy', async ({ command, ack, client, body }) => {
    await ack(); // Acknowledge the command

    const channel_id = command.channel_id;

    // Abre el modal para que el usuario escriba la copia
    await client.views.open({
        trigger_id: body.trigger_id,
        view: await copyModal(channel_id), // Usamos la función copyModal
    });
});

// Vista del modal "Post New Copy"
app.view('post_copy', async ({ ack, body, view, client }) => {
    const state = view.state.values;
    const channels = state.channel.channel.selected_conversations;

    // Verificar que solo se haya seleccionado un canal
    if (channels.length > 1) {
        await ack({
            response_action: "errors",
            errors: {
                channel: "You can only select one channel"
            }
        });
        return;
    }

    // Verificar que no se haya seleccionado un usuario como canal
    for (let i = 0; i < channels.length; i++) {
        if (channels[i].startsWith("U")) {
            await ack({
                response_action: "errors",
                errors: {
                    channel: "You can't select a user"
                }
            });
            return;
        }
    }

    const copy = state.copy.copy.rich_text_value;
    const channel = channels[0];
    const channel_id = view.private_metadata || null;

    // Botones de Aprobación y Rechazo
    const buttons = {
        "type": "actions",
        "block_id": "buttons",
        "elements": [
            {
                "type": "button",
                "style": 'primary',
                "action_id": "approve",
                "text": {
                    "type": "plain_text",
                    "text": "Approve"
                }
            },
            {
                "type": "button",
                "style": 'danger',
                "action_id": "refuse",
                "text": {
                    "type": "plain_text",
                    "text": "Refuse"
                }
            }
        ]
    };

    // Header y Divider para el mensaje
    const header = {
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": "A new copy has been posted!",
            "emoji": true
        }
    };

    const divider = {
        "type": "divider"
    };

    try {
        // Publicar la copia en el canal seleccionado
        await client.chat.postMessage({
            channel: channel,
            text: " ",
            attachments: [
                {
                    color: "#FFFFFF",
                    blocks: [header, divider, copy, buttons]
                }
            ]
        });
    } catch (error) {
        await ack({
            response_action: "errors",
            errors: {
                channel: "The bot needs to be invited to the channel."
            }
        });
        return;
    }

    await ack();

    // Si el canal_id está presente, enviar un mensaje efímero
    if (channel_id) {
        await client.chat.postEphemeral({
            channel: channel_id,
            user: body.user.id,
            text: "Copy posted!"
        });
    } else {
        // Actualizar la home tab con un mensaje de éxito
        await client.views.publish({
            user_id: body.user.id,
            view: await appHomeSuccess(client)
        });
    }
});

// Evento cuando el usuario envía el modal de feedback
app.view('post_feedback', async ({ ack, body, view, client }) => {
    // Extraer el canal y thread del modal
    let { channel_id, thread_ts } = JSON.parse(view.private_metadata);

    // Extraer el feedback ingresado por el usuario
    const state = view.state.values;
    const feedback = state.feedback.feedback.rich_text_value;

    // Acknowledging the submission of the feedback modal
    await ack();

    // Obtener el mensaje original en el canal (esto es necesario para agregar el feedback al mensaje)
    const message = await client.conversations.replies({
        channel: channel_id,
        ts: thread_ts
    });

    // Obtener los bloques de los adjuntos del mensaje
    const attachment_blocks = message.messages[0].attachments[0].blocks;

    // Eliminar el último bloque (el bloque de "Leave Feedback" que fue utilizado)
    attachment_blocks.pop();

    // Publicar el feedback en el canal
    await client.chat.update({
        channel: channel_id,
        ts: thread_ts,
        text: " ",
        attachments: [
            {
                color: "db2c2c", // Color para indicar que es un feedback
                blocks: [
                    ...attachment_blocks, // Los bloques originales del mensaje
                    {
                        "type": "context",
                        "elements": [
                            {
                                "text": `Feedback by <@${body.user.id}>`,
                                "type": "mrkdwn"
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": `*Feedback:* ${feedback}`
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // Opcional: enviar un mensaje efímero para confirmar que el feedback fue publicado
    await client.chat.postEphemeral({
        channel: channel_id,
        user: body.user.id,
        text: "Your feedback has been posted successfully!"
    });
});


// Acción para aprobar la copia
app.action('approve', async ({ ack, body, client }) => {
    await ack();

    const userId = body.user.id;
    const ts = body.message.ts;
    const channel = body.channel.id;

    const attachment_blocks = body.message.attachments[0].blocks;

    // Eliminar los primeros 2 bloques y el último
    attachment_blocks.shift();
    attachment_blocks.shift();
    attachment_blocks.pop();

    // Actualizar el mensaje de la copia aprobada
    await client.chat.update({
        channel: channel,
        ts: ts,
        text: " ",
        attachments: [
            {
                color: "#1adb47",
                blocks: [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `Copy was approved!`,
                            "emoji": true
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": `Approved by <@${userId}>`
                            }
                        ]
                    },
                    ...attachment_blocks
                ]
            }
        ]
    });
});

// Acción para rechazar la copia
app.action('refuse', async ({ ack, body, client }) => {
    await ack();

    const userId = body.user.id;
    const ts = body.message.ts;
    const channel = body.channel.id;

    const attachment_blocks = body.message.attachments[0].blocks;

    // Eliminar los primeros 2 bloques y el último
    attachment_blocks.shift();
    attachment_blocks.shift();
    attachment_blocks.pop();

    // Agregar el botón de "Leave Feedback" al final
    attachment_blocks.push({
        "type": "actions",
        "block_id": "buttons",
        "elements": [
            {
                "type": "button",
                "action_id": "feedback",
                "text": {
                    "type": "plain_text",
                    "text": "Leave Feedback"
                }
            }
        ]
    });

    // Actualizar el mensaje de la copia rechazada
    await client.chat.update({
        channel: channel,
        ts: ts,
        text: " ",
        attachments: [
            {
                color: "#db2c2c",
                blocks: [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `Copy was refused.`,
                            "emoji": true
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": `Refused by <@${userId}>`
                            }
                        ]
                    },
                    ...attachment_blocks,
                ]
            }
        ]
    });
});

// Acción para abrir el modal de retroalimentación
app.action('feedback', async ({ ack, body, client }) => {
    await ack();

    const thread_ts = body.message.ts;
    const channel = body.channel.id;

    // Mostrar el modal de retroalimentación
    await client.views.open({
        trigger_id: body.trigger_id,
        view: await feedbackModal(channel, thread_ts)
    });
});

// Acción para abrir el modal de "Post New Copy"
app.action('post_copy_open_modal', async ({ ack, body, client }) => {
    await ack();

    // Mostrar el modal "Post New Copy"
    await client.views.open({
        trigger_id: body.trigger_id,
        view: await copyModal(body.channel.id)
    });
});

// Evento para abrir la home tab
app.event('app_home_opened', async ({ event, client }) => {
    // Mostrar la vista de la home tab
    await client.views.publish({
        user_id: event.user,
        view: await appHome(client)
    });
});

(async () => {
    await app.start();
    console.log('⚡️ CopyBot app is running!');
})();
