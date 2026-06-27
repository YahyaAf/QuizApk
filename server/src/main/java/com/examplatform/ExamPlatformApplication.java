package com.examplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ExamPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExamPlatformApplication.class, args);
    }
}
