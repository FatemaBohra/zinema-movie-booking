package com.zinema.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingDTO {
    private String bookingId;
    private String movieId;
    private String showtimeId;
    private String seatId;
    private String status;
    private double totalAmount;
    private String createdAt;
    private String paymentId;
}