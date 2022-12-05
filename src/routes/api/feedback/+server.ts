import type { RequestHandler } from "@sveltejs/kit";
import { authRedirect } from "$lib/auth";
import { decodeAuthCallback } from "$lib/auth";
import { send } from "../../../lib/mail";
import { errorRedirect, publicDomain, raise, successRedirect } from "$lib/util";
import { encrypt } from "$lib/encryption";
import crypto from "crypto";

type FeedbackRequest = {
    shareEmail: boolean,
    subject: string,
    message: string,
    recipients: string[],
};

const valid_recipients = [
    "welfare-m",
    "welfare-f",
    "lgbt",
    "edo",
    "disabilities",
    "classact"
];

function parseForm(data: FormData): FeedbackRequest {
    if (data.get('agreed') !== 'on') raise('Terms and conditions were not agreed to!');
    const message = data.get("message") as string ?? raise('No message!');
    const subject = data.get("subject") as string ?? raise('No subject!');
    if (message.length == 0) raise("Message was empty!");
    if (subject.length == 0) raise("Subject was empty!");

    const recipients = data.getAll("share-with") as string[];
    const invalid_recipients = recipients.filter(x => valid_recipients.findIndex(y => x === y) == -1);
    if (invalid_recipients.length > 0) raise("Invalid recipients: " + invalid_recipients.join(", "));

    return {
        shareEmail: data.get("anonymous") !== 'on',
        subject,
        message,
        recipients
    };
}

function error(reason: string): Response {
	const title = "Something Went Wrong!";
	const message = "Something wasn't quite right, and we couldn't submit your feedback. Please contact the webmaster if this issue persists.";
	return errorRedirect(title, message, reason, "/get-involved/feedback");
}

function success(): Response {
	const title = "Feedback Submitted Successfully!";
	const message = "Your feedback has been submitted successfully. We will do our best to get back to you in a reasonable timeframe.";
	return successRedirect(title, message);
}

async function sendFeedback(request: FeedbackRequest, sender: string) {
    const recipients = request.recipients;
    if (recipients.length == 0) recipients.push("webmaster");

    let replyInstructions: string;

    if (request.shareEmail) {
        replyInstructions = 'To respond to the sender, simply reply to this email (the original sender is in the "Reply-To" header).';
    } else {
        const prefix = crypto.randomBytes(32).toString("hex");
        const encrypted = encodeURIComponent(encrypt(prefix + ":" + sender, "sender:"));
        replyInstructions = `To respond to the sender, use the following link: ${publicDomain}/get-involved/feedback/respond?subject=${encodeURIComponent(request.subject)}&recipient=${encrypted}`;
    }
    
    const template = {
        to: recipients.map(x => x + "@thejcr.co.uk"),
        subject: request.subject,
        replyTo: request.shareEmail ? sender : undefined,
        text: `${request.message}\n\n--------------\n\nRecipients: ${request.recipients.join(", ")}\n\n${replyInstructions}`
    };

    await send(template);
}

const POST: RequestHandler = async (event) => {
	let request: FeedbackRequest;
	try {
		request = parseForm(await event.request.formData());
	} catch (e) {
		console.error(e);
		if (e instanceof Error) {
			return error(e.message);
		} else {
			return error("Check Logs!");
		}
	}
	console.log(request);
	return authRedirect(`/api/feedback`, request);
};

const GET: RequestHandler = async (event) => {
	const { email: sender, state: feedbackRequest } = await decodeAuthCallback<FeedbackRequest>(event);
	try {
		await sendFeedback(feedbackRequest, sender);
	} catch (e) {
		console.error(e);
		return error("Failed to send email!");
	}
	return success();
};

export { POST, GET };
