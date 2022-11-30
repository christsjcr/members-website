import sjcl from "sjcl";

const password = import.meta.env.VITE_ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY;

function encrypt<T>(message: T, prefix: string): string {
    const plaintext = prefix + JSON.stringify(message);
    return sjcl.encrypt(password, plaintext) as unknown as string;
}

function decrypt<T>(ciphertext: string, prefix: string): T {
    const plaintext = sjcl.decrypt(password, ciphertext);
    if (!plaintext.startsWith(prefix)) {
        throw new Error('Prefix does not match!');
    }
    return JSON.parse(plaintext.substring(prefix.length));
}

export {encrypt, decrypt}
