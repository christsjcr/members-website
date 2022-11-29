import type { RequestHandler } from "@sveltejs/kit";
import { error, success, type FeedbackRequest } from "../feedback-request";
import { send } from "./mail";

const clientId = import.meta.env.VITE_CLIENT_ID ?? process.env.CLIENT_ID;
const secret = import.meta.env.VITE_CLIENT_SECRET ?? process.env.CLIENT_SECRET;
const domain = import.meta.env.VITE_DOMAIN ?? "https://thejcr.co.uk";

const tokenURL = 'https://oauth2.googleapis.com/token';
const userURL = 'https://openidconnect.googleapis.com/v1/userinfo';
const redirectURL = `${domain}/api/feedback/callback`;

async function getAccessToken(code: string) {
	const response = await fetch(tokenURL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: secret,
			redirect_uri: redirectURL,
			grant_type: 'authorization_code',
			code
		})
	});
	const json = await response.json();
	return json.access_token;
}

async function getUser(accessToken: string) {
	const response = await fetch(userURL, {
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	});
	return await response.json();
}


const GET: RequestHandler = async (event) => {
	const feedbackRequest = JSON.parse(decodeURIComponent(event.url.searchParams.get('state') ?? "")) as FeedbackRequest;
		
	const code = event.url.searchParams.get('code');
	let sender: string;
	try {
		const accessToken = await getAccessToken(code ?? "");
	
		const user = await getUser(accessToken);

		console.log(user);

		if (user == null) {
			return error("Authentication failed!");
		}

		sender = user.email;
	} catch(e) {
		console.error(e);
		return error("Authentication failed!");
	}

	try {
		await send(feedbackRequest, sender);
	} catch (e) {
		console.error(e);
		return error("Failed to send email!");
	}

	return success();
};

export { GET };
