import { send } from "$lib/mail";
import util from "util";

const genericErrorMessage = "An error report (with sensitive details redacted) has been sent to the webmaster, who will do their best to fix the issue as soon as possible. Please try again in a couple of days, and contact the webmaster if this issue persists."

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

async function logError(subject: string, error: unknown, requestCopy: Request) {
    let message = "";
    let stack = "";
    const body = requestCopy.body ? (await requestCopy.text()).replace(/subject=[^&]*/, "subject=[REDACTED SUBJECT]").replace(/message=[^&]*/, "message=[REDACTED MESSAGE]") : "[NO BODY FOUND]";

    if (error instanceof Error) {
        message = error.toString();
        stack = error.stack ?? "undefined";
    } else {
        message = `${error}`;
        stack = "undefined";
    }

    await log(subject, `${message}\n\n Stack: ${stack}\n\n Body: ${body}\n\nRequest: ${util.inspect(requestCopy, { showHidden: true, depth: null })}`)
}

export { log, logError, genericErrorMessage };