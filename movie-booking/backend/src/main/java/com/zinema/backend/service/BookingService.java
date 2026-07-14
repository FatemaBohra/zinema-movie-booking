package com.zinema.backend.service;

import com.zinema.backend.model.Booking;
import com.zinema.backend.model.Showtime;
import com.zinema.backend.repository.BookingRepository;
import com.zinema.backend.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;

    public Booking createBooking(String userId, String showtimeId, String seatId) {
        // 1. Get the showtime
        Showtime showtime = showtimeRepository.findById(showtimeId);
        if (showtime == null) {
            throw new RuntimeException("Showtime not found");
        }

        // 2. Check seat availability
        if (showtime.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available for this showtime");
        }

        // 3. Create the booking
        String bookingId = "BOOKING-" + UUID.randomUUID();
        Booking booking = Booking.builder()
                .userId(userId)
                .sk(bookingId)
                .bookingId(bookingId)
                .movieId(showtime.getMovieId())
                .showtimeId(showtimeId)
                .seatId(seatId)
                .status("CONFIRMED")
                .totalAmount(showtime.getTicketPrice())
                .createdAt(LocalDateTime.now().toString())
                .build();

        // 4. Save booking
        bookingRepository.save(booking);

        // 5. Decrement available seats
        showtime.setAvailableSeats(showtime.getAvailableSeats() - 1);
        showtimeRepository.save(showtime);

        return booking;
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking cancelBooking(String userId, String bookingId) {
        // 1. Find the booking
        Booking booking = bookingRepository.findById(userId, bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }

        // 2. Update status to CANCELLED
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // 3. Increment available seats back
        Showtime showtime = showtimeRepository.findById(booking.getShowtimeId());
        if (showtime != null) {
            showtime.setAvailableSeats(showtime.getAvailableSeats() + 1);
            showtimeRepository.save(showtime);
        }

        return booking;
    }
}