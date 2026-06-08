package com.OdontoHelpBackend.infra.storage;

import com.OdontoHelpBackend.infra.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService {

    private final StorageProperties properties;
    private S3Client s3Client;
    private S3Presigner presigner;

    @PostConstruct
    void init() {
        var credentials = AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey());
        var credentialsProvider = StaticCredentialsProvider.create(credentials);
        var s3Config = S3Configuration.builder().pathStyleAccessEnabled(true).build();

        s3Client = S3Client.builder()
                .endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(credentialsProvider)
                .serviceConfiguration(s3Config)
                .build();

        presigner = S3Presigner.builder()
                .endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(credentialsProvider)
                .serviceConfiguration(s3Config)
                .build();

        ensureBucketExists();
    }

    @Override
    public void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(properties.getBucket()).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(properties.getBucket()).build());
        } catch (S3Exception e) {
            throw new BusinessException("Erro ao verificar bucket de arquivos: " + e.getMessage());
        }
    }

    @Override
    public void upload(String key, InputStream inputStream, long size, String contentType) {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(properties.getBucket())
                        .key(key)
                        .contentType(contentType)
                        .contentLength(size)
                        .build(),
                RequestBody.fromInputStream(inputStream, size)
        );
    }

    @Override
    public InputStream download(String key) {
        return s3Client.getObject(GetObjectRequest.builder()
                .bucket(properties.getBucket())
                .key(key)
                .build());
    }

    @Override
    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(properties.getBucket())
                .key(key)
                .build());
    }

    @Override
    public String presignedGetUrl(String key, Duration duration) {
        var getRequest = GetObjectRequest.builder()
                .bucket(properties.getBucket())
                .key(key)
                .build();
        var presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(getRequest)
                .build();
        return presigner.presignGetObject(presignRequest).url().toString();
    }
}
