import type { RequestHandler } from "@sveltejs/kit";

const clientId = import.meta.env.VITE_CLIENT_ID ?? process.env.CLIENT_ID;
const domain = import.meta.env.VITE_DOMAIN ?? "https://members.thejcr.co.uk";

const authURL = 'https://accounts.google.com/o/oauth2/v2/auth?hd=cam.ac.uk';
const redirectURL = `${domain}/api/feedback/callback`;


const POST: RequestHandler = async (event) => {
	console.log(event);
	const state = event.url.searchParams.get('content') ?? "";
	return new Response("", {
		status: 302,
		headers: {
			location: `${authURL}&client_id=${clientId}&state=${encodeURIComponent(state)}&scope=profile email openid&response_type=code&redirect_uri=${encodeURIComponent(redirectURL)}`,
		}
	});
};

export { POST };
