package com.zinema.backend.controller;

import com.zinema.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class S3Controller {

    private final S3Service s3Service;

    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam String fileName,
            @RequestParam String contentType) {
        String presignedUrl = s3Service.generatePresignedUploadUrl(fileName, contentType);
        Map<String, String> response = new HashMap<>();
        response.put("uploadUrl", presignedUrl);
        response.put("posterUrl", presignedUrl.split("\\?")[0]);
        return ResponseEntity.ok(response);
    }
}