import type { RequestHandler } from "@sveltejs/kit";
import { authRedirect } from "$lib/auth";
import { decodeAuthCallback } from "$lib/auth";
import { send } from "$lib/mail";
import { errorRedirect, raise, successRedirect } from "$lib/util";
import { decrypt } from "$lib/encryption";
import { valid_revealers } from "../people";
import { genericErrorMessage, logError } from "../log";

type FeedbackReveal = {
    encryptedEmail: string,
};

function parseForm(data: FormData): FeedbackReveal {
    const encryptedEmail = data.get("encrypted") as string ?? raise('No encrypted value provided!');
    return {
        encryptedEmail
    };
}

function error(reason: string): Response {
	const title = "Something Went Wrong!";
	const message = `Something wasn't quite right, and we couldn't reveal the sender of this message. ${genericErrorMessage}`;
	return errorRedirect(title, message, reason, "/get-involved/feedback");
}

function success(revealedEmail: string): Response {
	const title = "Email Revealed Successfully!";
	const message = `The email that made the form submission was: ${revealedEmail}. Other members of the Committee have been alerted to this action.`;
	return successRedirect(title, message);
}

async function revealEmail(request: FeedbackReveal, sender: string): Promise<string> {
    const senderCRSID = sender.replace("@cam.ac.uk", "");

    if (!Object.keys(valid_revealers).includes(senderCRSID)) raise("You are not authorised to reveal messages!");
    const senderId = valid_revealers[senderCRSID as keyof typeof valid_revealers];

    const prefixedEmail = decrypt<string>(request.encryptedEmail, "sender:");
    const revealedEmail = prefixedEmail.slice(65);

    const recipients = Object.values(valid_revealers).map(x => x + "@thejcr.co.uk");

    const template = {
        senderName: `Feedback System`,
        to: recipients,
        subject: `Form Submission has been De-Anonymised`,
        text: `A submission reveal request was successfully made by ${senderId}.`
    };

    await send(template);

    return revealedEmail;
}

const POST: RequestHandler = async (event) => {
    const copiedRequest = event.request.clone();
    let request: FeedbackReveal;
	try {
		request = parseForm(await event.request.formData());
	} catch (e) {
		console.error(e);
		try {
            await logError("Reveal POST Failed", e, copiedRequest);
        } catch (f) {
            console.error(f);
        }
		if (e instanceof Error) {
			return error(e.message);
		} else {
			return error("Check Logs!");
		}
	}
	return authRedirect(`/api/feedback/reveal`, request);
};

const GET: RequestHandler = async (event) => {
    const copiedRequest = event.request.clone();
	const { email: sender, state: feedbackResponse } = await decodeAuthCallback<FeedbackReveal>(event);
    let revealed: string;
    try {
		revealed = await revealEmail(feedbackResponse, sender);
	} catch (e) {
		console.error(e);
		try {
            await logError("Reveal GET Failed", e, copiedRequest);
        } catch (f) {
            console.error(f);
        }
		return error("Failed to send email!");
	}
	return success(revealed);
};

export { POST, GET };
