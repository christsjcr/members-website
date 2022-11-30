import type { RequestHandler } from "@sveltejs/kit";
import { authRedirect } from "$lib/auth";
import { success, error, fromForm, type FeedbackRequest } from "./feedback-request";
import { decodeAuthCallback } from "$lib/auth";
import { send } from "./mail";

const POST: RequestHandler = async (event) => {
	let request: FeedbackRequest;
	try {
		request = fromForm(await event.request.formData());
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
		await send(feedbackRequest, sender);
	} catch (e) {
		console.error(e);
		return error("Failed to send email!");
	}
	return success();
};

export { POST, GET };
