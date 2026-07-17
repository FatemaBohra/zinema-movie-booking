package com.zinema.backend.controller;

import com.zinema.backend.model.Booking;
import com.zinema.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.zinema.backend.dto.DtoMapper;
import com.zinema.backend.dto.BookingDTO;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://zinema-movie-booking.vercel.app"
})
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getBookingsByUser());
    }

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/showtime/{showtimeId}/seats")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable String showtimeId) {
        List<String> bookedSeats = bookingService.getBookedSeatsForShowtime(showtimeId);
        return ResponseEntity.ok(bookedSeats);
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId));
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @RequestParam String showtimeId,
            @RequestParam String seatId,
            @RequestParam(required = false) String paymentIntentId) {
        Booking booking = bookingService.createBooking(showtimeId, seatId, paymentIntentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.enrichBooking(booking));
    }
}