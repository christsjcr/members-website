import nodemailer from "nodemailer";

const feedbackEmailAddress = import.meta.env.VITE_FEEDBACK_EMAIL_ADDRESS ?? process.env.FEEDBACK_EMAIL_ADDRESS;
const feedbackEmailPassword = import.meta.env.VITE_FEEDBACK_EMAIL_PASSWORD ?? process.env.FEEDBACK_EMAIL_PASSWORD;

async function send(data: {to: string[], subject: string, replyTo?: string, text: string, senderName: string}) {
	const transport = nodemailer.createTransport({
		host: "mail.postale.io",
		port: 465,
		auth: {
			user: feedbackEmailAddress,
			pass: feedbackEmailPassword,
		},
	});

	const template = {
		...data,
		from: {
			name: data.senderName,
			address: feedbackEmailAddress,
		}
	};

	await transport.sendMail(template);
}


export { send };
