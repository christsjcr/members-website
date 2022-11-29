import type { RequestHandler } from "@sveltejs/kit";
import { redirect, error, fromForm, type FeedbackRequest } from "./feedback-request";

const clientId = import.meta.env.VITE_CLIENT_ID ?? process.env.CLIENT_ID;
const domain = import.meta.env.VITE_DOMAIN ?? "https://members.thejcr.co.uk";

const authURL = 'https://accounts.google.com/o/oauth2/v2/auth?hd=cam.ac.uk';
const redirectURL = `${domain}/api/feedback/callback`;


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
	return redirect(`${authURL}&client_id=${clientId}&state=${encodeURIComponent(JSON.stringify(request))}&scope=profile email openid&response_type=code&redirect_uri=${encodeURIComponent(redirectURL)}`);
};

export { POST };
