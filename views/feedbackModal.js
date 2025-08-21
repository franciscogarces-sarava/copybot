const feedbackModal = async (channel_id, thread_ts) => {
    const view = {
        "type": "modal", // Especificamos que es un modal
        "private_metadata": JSON.stringify({ channel_id, thread_ts }), // Guardamos los datos del canal y thread
        "callback_id": "post_feedback", // Este callback_id es para identificar la vista del modal
        "title": {
            "type": "plain_text",
            "text": "Feedback", // Título del modal
            "emoji": true
        },
        "submit": {
            "type": "plain_text",
            "text": "Post Feedback", // Texto del botón de envío
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel", // Texto del botón para cerrar
            "emoji": true
        },
        "blocks": [
            {
                "type": "input", // Este bloque es para el campo de texto donde el usuario dejará su feedback
                "block_id": "feedback", // ID único del bloque
                "element": {
                    "type": "rich_text_input", // Tipo de entrada para texto enriquecido
                    "action_id": "feedback" // ID de acción para que el servidor maneje la entrada
                },
                "label": {
                    "type": "plain_text",
                    "text": "Write your feedback here", // Etiqueta del campo
                    "emoji": true
                }
            }
        ]
    };

    return view; // Retornamos la vista del modal
}

module.exports = { feedbackModal };
