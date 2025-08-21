const appHome = async (client) => {
    const view = {
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Copy Bot Dashboard",
                    "emoji": true
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "The bot needs to be invited to channels in order to post copy to them. To invite it simply tag it in the channel and click Invite Now."
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "block_id": "post_copy_open_modal",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Post New Copy",
                            "emoji": true
                        },
                        "value": "post_copy",
                        "action_id": "post_copy_open_modal"
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Made by <https://twitter.com/RaphyLemos|Lemos>"
                    }
                ]
            }
        ]
    };
    return view;
}

const appHomeSuccess = async (client) => {
    const view = {
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Copy Bot Dashboard",
                    "emoji": true
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "The bot needs to be invited to channels in order to post copy to them. To invite it simply tag it in the channel and click Invite Now."
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "block_id": "post_copy_open_modal",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Post New Copy",
                            "emoji": true
                        },
                        "value": "post_copy",
                        "action_id": "post_copy_open_modal"
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Made by <https://twitter.com/RaphyLemos|Lemos>"
                    }
                ]
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Copy was posted successfully! ✅",
                    "emoji": true
                }
            },
        ]
    };
    return view;
}

module.exports = { appHome, appHomeSuccess };
