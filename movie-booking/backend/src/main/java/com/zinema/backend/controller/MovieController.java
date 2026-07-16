/**
 * note:
 * @RestController means every method returns JSON automatically.
 * @RequestMapping("/api/movies") is the base URL for all endpoints.
 * @CrossOrigin(origins = "http://localhost:5173") allows React app to call this API during development
 *
 * The endpoints are:
 * GET /api/movies — all movies
 * GET /api/movies/{id} — single movie
 * POST /api/movies — create movie
 * PUT /api/movies/{id} — update movie
 * DELETE /api/movies/{id} — delete movie
 * */
package com.zinema.backend.controller;

import com.zinema.backend.model.Movie;
import com.zinema.backend.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.zinema.backend.dto.DtoMapper;
import com.zinema.backend.dto.MovieDTO;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<List<MovieDTO>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies()
                .stream()
                .map(DtoMapper::toMovieDTO)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/{movieId}")
    public ResponseEntity<MovieDTO> getMovie(@PathVariable String movieId) {
        Movie movie = movieService.getMovie(movieId);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoMapper.toMovieDTO(movie));
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<MovieDTO> createMovie(@RequestBody Movie movie) {
        Movie created = movieService.createMovie(movie);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toMovieDTO(created));
    }

    @PutMapping("/{movieId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<MovieDTO> updateMovie(@PathVariable String movieId,
                                                @RequestBody Movie movie) {
        movie.setMovieId(movieId);
        return ResponseEntity.ok(DtoMapper.toMovieDTO(movieService.updateMovie(movie)));
    }

    @DeleteMapping("/{movieId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteMovie(@PathVariable String movieId) {
        movieService.deleteMovie(movieId);
        return ResponseEntity.noContent().build();
    }
}