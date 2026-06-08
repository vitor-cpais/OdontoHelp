package br.com.odontohelp.fiscal.util;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class CryptoService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Value("${crypto.secret-key}")
    private String secretKeyBase64;

    private SecretKey key;

    @PostConstruct
    void init() {
        if (secretKeyBase64 == null || secretKeyBase64.isBlank()) {
            throw new IllegalStateException("crypto.secret-key (CRYPTO_SECRET_KEY) nao configurado");
        }
        byte[] keyBytes = Base64.getDecoder().decode(secretKeyBase64.trim());
        if (keyBytes.length != 32) {
            throw new IllegalStateException("CRYPTO_SECRET_KEY deve ter 256 bits (32 bytes em Base64)");
        }
        this.key = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv) + ":"
                    + Base64.getEncoder().encodeToString(cipherText);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao cifrar dado sensivel", ex);
        }
    }

    public String decrypt(String encrypted) {
        if (encrypted == null || encrypted.isEmpty()) {
            return encrypted;
        }
        if (!isEncrypted(encrypted)) {
            return encrypted;
        }
        try {
            String[] parts = encrypted.split(":", 2);
            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] cipherText = Base64.getDecoder().decode(parts[1]);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao decifrar dado sensivel", ex);
        }
    }

    public boolean isEncrypted(String value) {
        if (value == null || value.isBlank() || !value.contains(":")) {
            return false;
        }
        String[] parts = value.split(":", 2);
        if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
            return false;
        }
        try {
            Base64.getDecoder().decode(parts[0]);
            Base64.getDecoder().decode(parts[1]);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    public String lookupHash(String normalizedPlaintext) {
        if (normalizedPlaintext == null || normalizedPlaintext.isBlank()) {
            return null;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getEncoded(), "HmacSHA256"));
            byte[] hash = mac.doFinal(normalizedPlaintext.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao gerar hash de busca", ex);
        }
    }
}
