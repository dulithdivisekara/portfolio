#!/usr/bin/env node
// Usage: node scripts/generate-password-hash.js <password> <salt>
// Prints the value to store as the ADMIN_PASSWORD_HASH secret.
// The salt must be the SAME value you store as the PASSWORD_SALT secret.

const crypto = require('crypto');

const [password, salt] = process.argv.slice(2);

if (!password || !salt) {
    console.error('Usage: node scripts/generate-password-hash.js <password> <salt>');
    process.exit(1);
}

const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
console.log(hash);
