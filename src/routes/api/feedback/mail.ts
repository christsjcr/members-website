import { encrypt } from "$lib/encryption";
import { publicDomain } from "$lib/util";
import nodemailer from "nodemailer";
import type { FeedbackRequest } from "./feedback-request";
import crypto from "crypto";

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

    let replyInstructions: string;

    if (request.shareEmail) {
        replyInstructions = 'To respond to the sender, simply reply to this email (the original sender is in the "Reply-To" header).';
    } else {
        const prefix = crypto.randomBytes(32).toString("hex");
        const encrypted = encodeURIComponent(encrypt(prefix + ":" + sender, "sender:"));
        replyInstructions = `To respond to the sender, use the following link: ${publicDomain}/get-involved/feedback/respond?id=${encrypted}`;
    }
    
    const template = {
        to: feedbackEmailAddress,
        from: feedbackEmailAddress,
        subject: request.subject,
        replyTo: request.shareEmail ? sender : undefined,
        text: `${request.message}\n\n--------------\n\nRecipients: ${request.recipients.join(", ")}\n\n${replyInstructions}`
    };

    await transport.sendMail(template);
}

export { send };
