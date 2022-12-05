
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

function raise(message: string) {
    throw new Error(message);
}

function errorRedirect(title: string, message: string, reason?: string, retryPath?: string): Response {
	return redirect(`${publicDomain}/error?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}${reason ? "&reason="+encodeURIComponent(reason) : ''}${retryPath ? "&retry="+encodeURIComponent(publicDomain + retryPath) : ""}`);
}

function successRedirect(title: string, message: string): Response {
    return redirect(`${publicDomain}/success?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`);
}


export { redirect, publicDomain, domain, raise, errorRedirect, successRedirect };