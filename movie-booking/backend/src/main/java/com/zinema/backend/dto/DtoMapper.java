/**
 *  a mapper to convert models to DTOs
 * */
package com.zinema.backend.dto;

import com.zinema.backend.model.Booking;
import com.zinema.backend.model.Movie;
import com.zinema.backend.model.Showtime;

public class DtoMapper {

    public static MovieDTO toMovieDTO(Movie movie) {
        return MovieDTO.builder()
                .movieId(movie.getMovieId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .genre(movie.getGenre())
                .director(movie.getDirector())
                .durationMinutes(movie.getDurationMinutes())
                .posterUrl(movie.getPosterUrl())
                .releaseDate(movie.getReleaseDate())
                .rating(movie.getRating())
                .build();
    }

    public static ShowtimeDTO toShowtimeDTO(Showtime showtime) {
        return ShowtimeDTO.builder()
                .showtimeId(showtime.getShowtimeId())
                .movieId(showtime.getMovieId())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .hall(showtime.getHall())
                .totalSeats(showtime.getTotalSeats())
                .availableSeats(showtime.getAvailableSeats())
                .ticketPrice(showtime.getTicketPrice())
                .build();
    }

    public static BookingDTO toBookingDTO(Booking booking, Movie movie, Showtime showtime) {
        return BookingDTO.builder()
                .userId(booking.getUserId())
                .bookingId(booking.getBookingId())
                .movieId(booking.getMovieId())
                .movieTitle(movie != null ? movie.getTitle() : booking.getMovieId())
                .showtimeId(booking.getShowtimeId())
                .showtimeTime(showtime != null ? showtime.getStartTime() : booking.getShowtimeId())
                .hall(showtime != null ? showtime.getHall() : null)
                .seatId(booking.getSeatId())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .paymentId(booking.getPaymentId())
                .build();
    }
}
