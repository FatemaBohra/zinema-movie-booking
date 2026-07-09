/**
 * note:
 * @RequiredArgsConstructor from Lombok automatically injects MovieRepository via constructor —
 * no need to write @Autowired.
 * UUID.randomUUID() generates a unique ID for each new movie.
 * The MOVIE# prefix is the single-table design pattern.
 * */
package com.zinema.backend.service;

import com.zinema.backend.model.Movie;
import com.zinema.backend.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    public Movie createMovie(Movie movie) {
        movie.setMovieId("MOVIE#" + UUID.randomUUID());
        movie.setSk("METADATA");
        return movie;
    }

    public Movie getMovie(String movieId) {
        return movieRepository.findById(movieId);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public void deleteMovie(String movieId) {
        movieRepository.delete(movieId);
    }

    public Movie updateMovie(Movie movie) {
        movieRepository.save(movie);
        return movie;
    }
}