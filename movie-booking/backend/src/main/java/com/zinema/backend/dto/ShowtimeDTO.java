package com.zinema.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShowtimeDTO {
    private String showtimeId;
    private String movieId;
    private String startTime;
    private String endTime;
    private String hall;
    private Integer totalSeats;
    private Integer availableSeats;
    private double ticketPrice;
}