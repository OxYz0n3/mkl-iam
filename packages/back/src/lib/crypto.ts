import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";


if (!process.env.TOKEN_ENCRYPTION_KEY)
    throw new Error("TOKEN_ENCRYPTION_KEY is not defined (expected 64 hex characters / 32 bytes)");

const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex');

if (key.length !== 32)
    throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");


/**
 * Encrypts a token with AES-256-GCM. Output format: `iv.ciphertext.authTag` (base64).
 */
export function encryptToken(plain: string): string
{
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([ cipher.update(plain, 'utf8'), cipher.final() ]);

    return ([ iv.toString('base64'), ciphertext.toString('base64'), cipher.getAuthTag().toString('base64') ].join('.'));
}

export function decryptToken(encrypted: string): string
{
    const [ iv, ciphertext, authTag ] = encrypted.split('.');

    if (!iv || !ciphertext || !authTag)
        throw new Error("Invalid encrypted token format");

    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));

    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    return (Buffer.concat([ decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final() ]).toString('utf8'));
}
