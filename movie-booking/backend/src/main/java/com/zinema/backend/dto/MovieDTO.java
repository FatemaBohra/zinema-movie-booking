package com.zinema.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MovieDTO {
    private String movieId;
    private String title;
    private String description;
    private String genre;
    private String director;
    private Integer durationMinutes;
    private String posterUrl;
    private String releaseDate;
    private double rating;
}