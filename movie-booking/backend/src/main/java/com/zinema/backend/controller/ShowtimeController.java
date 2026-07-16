package com.zinema.backend.controller;

import com.zinema.backend.model.Showtime;
import com.zinema.backend.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.zinema.backend.dto.DtoMapper;
import com.zinema.backend.dto.ShowtimeDTO;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping
    public ResponseEntity<List<ShowtimeDTO>> getAllShowtimes() {
        return ResponseEntity.ok(showtimeService.getAllShowtimes()
                .stream()
                .map(DtoMapper::toShowtimeDTO)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/{showtimeId}")
    public ResponseEntity<ShowtimeDTO> getShowtime(@PathVariable String showtimeId) {
        Showtime showtime = showtimeService.getShowtime(showtimeId);
        if (showtime == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoMapper.toShowtimeDTO(showtime));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowtimeDTO>> getShowtimesByMovie(@PathVariable String movieId) {
        return ResponseEntity.ok(showtimeService.getShowtimesByMovie(movieId)
                .stream()
                .map(DtoMapper::toShowtimeDTO)
                .collect(java.util.stream.Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ShowtimeDTO> createShowtime(@RequestBody Showtime showtime) {
        Showtime created = showtimeService.createShowtime(showtime);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toShowtimeDTO(created));
    }

    @DeleteMapping("/{showtimeId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteShowtime(@PathVariable String showtimeId) {
        showtimeService.deleteShowtime(showtimeId);
        return ResponseEntity.noContent().build();
    }
}