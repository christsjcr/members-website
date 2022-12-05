import type { RequestEvent } from "@sveltejs/kit";
import { encrypt, decrypt } from "./encryption";
import { domain, redirect } from "./util";

const authURL = 'https://accounts.google.com/o/oauth2/v2/auth?hd=cam.ac.uk';

const tokenURL = 'https://oauth2.googleapis.com/token';
const userURL = 'https://openidconnect.googleapis.com/v1/userinfo';

const clientId = import.meta.env.VITE_CLIENT_ID ?? process.env.CLIENT_ID;
const secret = import.meta.env.VITE_CLIENT_SECRET ?? process.env.CLIENT_SECRET;

function unencryptedAuthRedirect(relativePath: string, unencodedState: string): Response {
    const encodedState = encodeURIComponent(unencodedState);
    return redirect(`${authURL}&client_id=${clientId}&state=${encodedState}&scope=profile email openid&response_type=code&redirect_uri=${encodeURIComponent(domain+relativePath)}`);
}

function authRedirect<T>(relativePath: string, state: T): Response {
    return unencryptedAuthRedirect(relativePath, encrypt(state, relativePath + ":"));
}

async function getAccessToken(code: string, pathname: string) {
	const response = await fetch(tokenURL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: secret,
			redirect_uri: `${domain}${pathname}`,
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

async function decodeAuthCallback<T>(event: RequestEvent): Promise<{email: string, state: T}> {
    const { email, state } = await decodeUnencryptedCallback(event);
    return {email, state: decrypt(state, event.url.pathname + ":")}
}

async function decodeUnencryptedCallback(event: RequestEvent): Promise<{ email: string, state: string }> {
	const state = event.url.searchParams.get('state');
	if (!state) throw new Error('State not provided!');

    const code = event.url.searchParams.get('code');
    if (!code) throw new Error('Code not provided!');

	let email: string | undefined;
	try {
		const accessToken = await getAccessToken(code ?? "", event.url.pathname);
		const user = await getUser(accessToken);
		email = user?.email;
	} catch(e) {
		console.error(e);
		throw new Error('Authentication failed!');
	}
	if (!email) throw new Error("Could not decode email!");

	return { email, state };
}

export { authRedirect, decodeAuthCallback };