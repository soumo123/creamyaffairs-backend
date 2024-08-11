// encryption.js
const crypto =require('crypto');

class Crypto {
  constructor(key) {
    console.log("keykey",key)
    this.algorithm = 'aes-256-cbc';
    this.key = Buffer.from(key, 'hex');
    this.iv = crypto.randomBytes(16);
  }

  encrypt(text) {
    let cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: this.iv.toString('hex'), encryptedData: encrypted.toString('hex') };
  }

  decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

export default Crypto;
