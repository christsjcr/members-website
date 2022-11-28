import type { RequestHandler } from "@sveltejs/kit";
import nodemailer from "nodemailer";

const clientId = import.meta.env.VITE_CLIENT_ID ?? process.env.CLIENT_ID;
const secret = import.meta.env.VITE_CLIENT_SECRET ?? process.env.CLIENT_SECRET;
const domain = import.meta.env.VITE_DOMAIN ?? "https://thejcr.co.uk";
const publicDomain = import.meta.env.VITE_PUBLIC_DOMAIN ?? "https://thejcr.co.uk";

const feedbackEmailAddress = import.meta.env.VITE_FEEDBACK_EMAIL_ADDRESS ?? process.env.FEEDBACK_EMAIL_ADDRESS;
const feedbackEmailPassword = import.meta.env.VITE_FEEDBACK_EMAIL_PASSWORD ?? process.env.FEEDBACK_EMAIL_PASSWORD;

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

function redirect(location: string): Response {
	return new Response("", {
		status: 302,
		headers: {
			location
		}
	})
}

function error(message: string): Response {
	return redirect(`${publicDomain}/feedback/error?message=${encodeURIComponent(message)}`)
}

async function send(message: string) {
	const transport = nodemailer.createTransport({
		host: "mail.postale.io",
		port: 465,
		auth: {
			user: feedbackEmailAddress,
			pass: feedbackEmailPassword,
		},
	});
	const mailOptions = {
		from: feedbackEmailAddress,
		to: feedbackEmailAddress,
		subject: "Feedback Test",
		text: message,
	};
	await transport.sendMail(mailOptions);
}

const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');

	try {
		const accessToken = await getAccessToken(code ?? "");
	
		const user = await getUser(accessToken);

		console.log(user);

		if (user == null) {
			return error("Authentication failed!");
		}
	} catch(e) {
		console.error(e);
		return error("Authentication failed!");
	}

	try {
		await send("Test Message");
	} catch (e) {
		console.error(e);
		return error("Failed to send email!");
	}

	return redirect(`${publicDomain}/feedback/success`);
};

export { GET };
