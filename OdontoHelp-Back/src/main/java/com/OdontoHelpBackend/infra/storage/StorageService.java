package com.OdontoHelpBackend.infra.storage;

import java.io.InputStream;
import java.time.Duration;

public interface StorageService {

    void upload(String key, InputStream inputStream, long size, String contentType);

    InputStream download(String key);

    void delete(String key);

    String presignedGetUrl(String key, Duration duration);

    void ensureBucketExists();
}
