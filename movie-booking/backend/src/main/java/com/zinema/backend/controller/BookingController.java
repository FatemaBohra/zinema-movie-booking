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

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings()
                .stream()
                .map(DtoMapper::toBookingDTO)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getBookingsByUser()
                .stream()
                .map(DtoMapper::toBookingDTO)
                .collect(java.util.stream.Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @RequestParam String showtimeId,
            @RequestParam String seatId) {
        Booking booking = bookingService.createBooking(showtimeId, seatId);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toBookingDTO(booking));
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable String bookingId) {
        Booking booking = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(DtoMapper.toBookingDTO(booking));
    }
}