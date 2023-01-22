import { send } from "$lib/mail";

async function log(subject: string, body: string) {
    const recipients = ["webmaster"];

    const template = {
        senderName: "Feedback System Logs",
        to: recipients.map(x => x + "@thejcr.co.uk"),
        subject,
        text: body
    };

    await send(template);
}

export { log };