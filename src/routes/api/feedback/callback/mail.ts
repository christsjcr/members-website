import nodemailer from "nodemailer";
import type { FeedbackRequest } from "../feedback-request";

const feedbackEmailAddress = import.meta.env.VITE_FEEDBACK_EMAIL_ADDRESS ?? process.env.FEEDBACK_EMAIL_ADDRESS;
const feedbackEmailPassword = import.meta.env.VITE_FEEDBACK_EMAIL_PASSWORD ?? process.env.FEEDBACK_EMAIL_PASSWORD;

async function send(request: FeedbackRequest, sender: string) {
	const transport = nodemailer.createTransport({
		host: "mail.postale.io",
		port: 465,
		auth: {
			user: feedbackEmailAddress,
			pass: feedbackEmailPassword,
		},
    });

    const recipients = request.recipients;
    if (recipients.length == 0) recipients.push("webmaster");
    
    const template = {
        to: feedbackEmailAddress,
        from: feedbackEmailAddress,
        subject: request.subject,
        replyTo: request.shareEmail ? sender : undefined,
        text: `Begin Feedback\n\n--------------\n\n${request.message}\n\n--------------\n\nRecipients: ${request.recipients.join(", ")}\n\n${request.shareEmail ? `To reply to this message, use the following link: ...` : 'To respond to the sender, simply reply to this email (the original sender is in the "Reply-To" header).'}`
    };

    await transport.sendMail(template);
}

export { send };
