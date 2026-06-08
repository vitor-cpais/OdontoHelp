package com.OdontoHelpBackend.infra.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private String endpoint = "http://localhost:9000";
    private String accessKey = "minioadmin";
    private String secretKey = "minioadmin";
    private String bucket = "odontohelp";
    private String region = "us-east-1";
    private int presignedUrlMinutes = 15;
    private long maxImageBytes = 10 * 1024 * 1024;
    private long maxPdfBytes = 20 * 1024 * 1024;
}
