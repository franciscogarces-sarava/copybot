const copyModal = async (channel_id) => {
    const view = {
        "title": {
            "type": "plain_text",
            "text": "Copy Editor",
            "emoji": true
        },
        "submit": {
            "type": "plain_text",
            "text": "Submit Copy",
            "emoji": true
        },
        "type": "modal",
        "private_metadata": channel_id,
        "callback_id": "post_copy",
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "blocks": [
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "The bot needs to be invited to the channel in order to post copy to it. To invite it simply tag it in the channel and click Invite Now."
                    }
                ]
            },
            {
                "type": "input",
                "block_id": "copy",
                "element": {
                    "type": "rich_text_input",
                    "action_id": "copy"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Copy",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "channel",
                "element": {
                    "type": "multi_conversations_select",
                    "action_id": "channel",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Where should the copy be sent?"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Channel"
                }
            },
        ]
    }
    return view;
}

module.exports = { copyModal }
