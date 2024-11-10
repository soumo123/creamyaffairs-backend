const CryptoJS = require('crypto-js');

class AkunahEncryption {
    #key;
    constructor(key) {
        this.#key = CryptoJS.enc.Base64.parse(key);
    }

    decrypt(cryptedData) {
        try {
            const decodedData = CryptoJS.enc.Base64.parse(cryptedData).toString(CryptoJS.enc.Utf8);
            const data = JSON.parse(decodedData);

            const iv = CryptoJS.enc.Base64.parse(data.iv);
            const value = CryptoJS.enc.Base64.parse(data.value);
            const decrypted = CryptoJS.AES.decrypt({ ciphertext: value }, this.#key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            return decryptedText;
        } catch (error) {
            console.error("Decryption error:", error);
            return null;
        }
    }

    encrypt(plainText) {
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(plainText, this.#key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const encryptedData = {
            iv: CryptoJS.enc.Base64.stringify(iv),
            value: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
        };
        encryptedData['mac'] = CryptoJS.HmacSHA256(encryptedData['iv'] + encryptedData['value'], this.#key).toString(CryptoJS.enc.Hex);

        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(encryptedData))).trim();
    }
}

module.exports = AkunahEncryption;
