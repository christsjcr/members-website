import type { RequestHandler } from "@sveltejs/kit";
import { authRedirect } from "$lib/auth";
import { decodeAuthCallback } from "$lib/auth";
import { send } from "$lib/mail";
import { errorRedirect, raise, successRedirect } from "$lib/util";
import { decrypt } from "$lib/encryption";
import { valid_responders } from "../people";
import { log } from "../log";


type FeedbackResponse = {
    subject: string,
    message: string,
    encryptedRecipient: string,
};

function parseForm(data: FormData): FeedbackResponse {
    const subject = data.get("subject") as string ?? raise('No subject!');
    const message = data.get("message") as string ?? raise('No message!');
    const encryptedRecipient = data.get("recipient") as string ?? raise('No recipient!');

    if (message.length == 0) raise("Message was empty!");
    if (subject.length == 0) raise("Subject was empty!");

    return {
        subject,
        message,
        encryptedRecipient
    };
}


function error(reason: string): Response {
	const title = "Something Went Wrong!";
	const message = "Something wasn't quite right, and we couldn't submit your response. Please contact the webmaster if this issue persists.";
	return errorRedirect(title, message, reason, "/get-involved/feedback");
}

function success(): Response {
	const title = "Response Sent Successfully!";
	const message = "Your response has been sent successfully. The original sender may choose to respond anonymously via the feedback form, or reveal their identity by replying directly.";
	return successRedirect(title, message);
}

async function sendResponse(request: FeedbackResponse, sender: string) {
    const encryptedRecipient = request.encryptedRecipient;

    const prefixedRecipient = decrypt<string>(encryptedRecipient, "sender:");
    const recipient = prefixedRecipient.slice(65);

    const senderCRSID = sender.replace("@cam.ac.uk", "")

    if (!Object.keys(valid_responders).includes(senderCRSID)) raise("You are not authorised to respond to messages!");
    const senderId = valid_responders[senderCRSID as keyof typeof valid_responders];

    const template = {
        senderName: `${senderId}@thejcr.co.uk`,
        to: [recipient],
        subject: `[RESPONSE] ${request.subject}`,
        replyTo: `${senderId}@thejcr.co.uk`,
        text: `${request.message}\n\n--------------\n\nThis response was sent via the anonymous feedback system, which allows Committee members to respond to your feedback without revealing your identity.\n\nYou can respond to this message by replying to this email directly (revealing your identity, if you haven't already), or by submitting another response to the anonymous feedback form.`
    };

    await send(template);
    await send({ ...template, to: [`${senderId}@thejcr.co.uk`], subject: `[SENT] ${template.subject}` });
    await log("Feedback Response Sent", `A response to feedback was sent by the following member: ${senderId}`);
}

const POST: RequestHandler = async (event) => {
	let request: FeedbackResponse;
	try {
		request = parseForm(await event.request.formData());
	} catch (e) {
        console.error(e);
        try {
            await log("Respond POST Failed", `Error: ${e}`);
        } catch (f) {
            console.error(f);
        }
		if (e instanceof Error) {
			return error(e.message);
		} else {
			return error("Check Logs!");
		}
	}
	return authRedirect(`/api/feedback/respond`, request);
};

const GET: RequestHandler = async (event) => {
	const { email: sender, state: feedbackResponse } = await decodeAuthCallback<FeedbackResponse>(event);
	try {
		await sendResponse(feedbackResponse, sender);
	} catch (e) {
        console.error(e);
        try {
            await log("Respond GET Failed", `Error: ${e}`);
        } catch (f) {
            console.error(f);
        }
		return error("Failed to send email!");
	}
	return success();
};

export { POST, GET };
