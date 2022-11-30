
const domain = import.meta.env.VITE_DOMAIN ?? "https://members.thejcr.co.uk";
const publicDomain = import.meta.env.VITE_PUBLIC_DOMAIN ?? "https://thejcr.co.uk";

function redirect(location: string): Response {
	return new Response("", {
		status: 302,
		headers: {
			location
		}
	})
}

export { redirect, publicDomain, domain };