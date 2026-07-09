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

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/{movieId}")
    public ResponseEntity<Movie> getMovie(@PathVariable String movieId) {
        Movie movie = movieService.getMovie(movieId);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(movie);
    }

    @PostMapping
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
        Movie created = movieService.createMovie(movie);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{movieId}")
    public ResponseEntity<Movie> updateMovie(@PathVariable String movieId,
                                             @RequestBody Movie movie) {
        movie.setMovieId(movieId);
        return ResponseEntity.ok(movieService.updateMovie(movie));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> deleteMovie(@PathVariable String movieId) {
        movieService.deleteMovie(movieId);
        return ResponseEntity.noContent().build();
    }
}