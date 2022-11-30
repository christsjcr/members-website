import { publicDomain, redirect } from "$lib/util";


type FeedbackRequest = {
    shareEmail: boolean,
    subject: string,
    message: string,
    recipients: string[],
};

const valid_recipients = [
    "welfare-m",
    "welfare-f",
    "lgbt",
    "edo",
    "disabilities",
    "classact"
];

const raise = (message: string) => {
    throw new Error(message);
};

function fromForm(data: FormData): FeedbackRequest {
    if (data.get('agreed') !== 'on') raise('Terms and conditions were not agreed to!');
    const message = data.get("message") as string ?? raise('No message!');
    const subject = data.get("subject") as string ?? raise('No subject!');
    if (message.length == 0) raise("Message was empty!");
    if (subject.length == 0) raise("Subject was empty!");

    const recipients = data.getAll("share-with") as string[];
    const invalid_recipients = recipients.filter(x => valid_recipients.findIndex(y => x === y) == -1);
    if (invalid_recipients.length > 0) raise("Invalid recipients: " + invalid_recipients.join(", "));

    return {
        shareEmail: data.get("anonymous") !== 'on',
        subject,
        message,
        recipients
    };
}

function error(message: string): Response {
	return redirect(`${publicDomain}/get-involved/feedback/error?reason=${encodeURIComponent(message)}`)
}

function success(): Response {
    return redirect(`${publicDomain}/get-involved/feedback/success`);
}

export { type FeedbackRequest, fromForm, error, success };
