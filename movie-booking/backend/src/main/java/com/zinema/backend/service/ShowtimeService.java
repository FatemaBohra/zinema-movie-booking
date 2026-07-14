/**NOTE: setAvailableSeats is set to totalSeats on creation
 * so when a showtime is first created, all seats are available*/
package com.zinema.backend.service;

import com.zinema.backend.model.Showtime;
import com.zinema.backend.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;

    public Showtime createShowtime(Showtime showtime) {
        showtime.setShowtimeId("SHOWTIME-" + UUID.randomUUID());
        showtime.setSk("METADATA");
        showtime.setAvailableSeats(showtime.getTotalSeats()); //
        showtimeRepository.save(showtime);
        return showtime;
    }

    public Showtime getShowtime(String showtimeId) {
        return showtimeRepository.findById(showtimeId);
    }

    public List<Showtime> getAllShowtimes() {
        return showtimeRepository.findAll();
    }

    public List<Showtime> getShowtimesByMovie(String movieId) {
        return showtimeRepository.findAll()
                .stream()
                .filter(s -> s.getMovieId().equals(movieId))
                .collect(java.util.stream.Collectors.toList());
    }

    public void deleteShowtime(String showtimeId) {
        showtimeRepository.delete(showtimeId);
    }
}