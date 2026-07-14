package com.zinema.backend.controller;

import com.zinema.backend.model.Booking;
import com.zinema.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestParam String userId,
            @RequestParam String showtimeId,
            @RequestParam String seatId) {
        Booking booking = bookingService.createBooking(userId, showtimeId, seatId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @RequestParam String userId,
            @PathVariable String bookingId) {
        Booking booking = bookingService.cancelBooking(userId, bookingId);
        return ResponseEntity.ok(booking);
    }
}