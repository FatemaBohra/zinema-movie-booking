package com.zinema.backend.service;

import com.zinema.backend.dto.BookingDTO;
import com.zinema.backend.dto.DtoMapper;
import com.zinema.backend.model.Booking;
import com.zinema.backend.model.Movie;
import com.zinema.backend.model.Showtime;
import com.zinema.backend.repository.BookingRepository;
import com.zinema.backend.repository.MovieRepository;
import com.zinema.backend.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;

    /**
     * Extracts the authenticated user's ID from the JWT token.
     * Instead of passing userId manually in every request,
     * we read it directly from the security context.
     * The JWT subject (sub) is the Auth0 user ID e.g. "auth0|6a5649eac6f7241ac1c8f700"
     */
    private String getCurrentUserId() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwt.getSubject();
    }

    /**
     * Creates a new booking for the currently authenticated user.
     * Flow:
     * 1. Extract userId from JWT token
     * 2. Find the showtime — throw if not found
     * 3. Check seat availability — throw if no seats left
     * 4. Create and save the booking with status CONFIRMED
     * 5. Decrement availableSeats on the showtime
     */
    public Booking createBooking(String showtimeId, String seatId, String paymentIntentId) {
        // Step 1 — get userId from JWT, not from request parameter
        String userId = getCurrentUserId();

        // Step 2 — fetch the showtime from DynamoDB
        Showtime showtime = showtimeRepository.findById(showtimeId);
        if (showtime == null) {
            throw new RuntimeException("Showtime not found");
        }

        // Step 3 — check if seats are available
        if (showtime.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available for this showtime");
        }

        // Step 4 — build and save the booking
        String bookingId = "BOOKING-" + UUID.randomUUID();
        Booking booking = Booking.builder()
                .userId(userId)
                .sk(bookingId)           // sort key in DynamoDB
                .bookingId(bookingId)
                .movieId(showtime.getMovieId())
                .showtimeId(showtimeId)
                .seatId(seatId)
                .status("CONFIRMED")
                .totalAmount(showtime.getTicketPrice())
                .createdAt(LocalDateTime.now().toString())
                .paymentId(paymentIntentId) // link payment intent
                .build();

        bookingRepository.save(booking);

        // Step 5 — decrement available seats so no one else can book the same seat
        showtime.setAvailableSeats(showtime.getAvailableSeats() - 1);
        showtimeRepository.save(showtime);

        return booking;
    }

    /**
     * Returns all bookings for the currently authenticated user.
     * userId is extracted from JWT — no need to pass it in the URL.
     */
    public List<BookingDTO> getBookingsByUser() {
        String userId = getCurrentUserId();
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::enrichBooking)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Returns all bookings across all users.
     * Used by the admin panel to view all bookings.
     */
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::enrichBooking)
                .collect(java.util.stream.Collectors.toList());
    }

    public BookingDTO enrichBooking(Booking booking) {
        Movie movie = movieRepository.findById(booking.getMovieId());
        Showtime showtime = showtimeRepository.findById(booking.getShowtimeId());
        String movieTitle = (movie == null || movie.isDeleted())
                ? "Movie no longer available"
                : movie.getTitle();
        return BookingDTO.builder()
                .bookingId(booking.getBookingId())
                .movieId(booking.getMovieId())
                .movieTitle(movieTitle)
                .showtimeId(booking.getShowtimeId())
                .showtimeTime(showtime != null ? showtime.getStartTime() : "")
                .hall(showtime != null ? showtime.getHall() : "")
                .seatId(booking.getSeatId())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .paymentId(booking.getPaymentId())
                .build();
    }

    /**
     * Cancels a booking for the currently authenticated user.
     * Flow:
     * 1. Extract userId from JWT
     * 2. Find the booking — throw if not found
     * 3. Update status to CANCELLED
     * 4. Increment availableSeats back on the showtime
     */
    public BookingDTO cancelBooking(String bookingId) {
        // Step 1 — get userId from JWT
        String userId = getCurrentUserId();

        // Step 2 — find the booking using userId (partition key) and bookingId (sort key)
        Booking booking = bookingRepository.findById(userId, bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }

        // Step 3 — mark as cancelled
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // Step 4 — give the seat back so others can book it
        Showtime showtime = showtimeRepository.findById(booking.getShowtimeId());
        if (showtime != null) {
            showtime.setAvailableSeats(showtime.getAvailableSeats() + 1);
            showtimeRepository.save(showtime);
        }

        return enrichBooking(booking);
    }
}