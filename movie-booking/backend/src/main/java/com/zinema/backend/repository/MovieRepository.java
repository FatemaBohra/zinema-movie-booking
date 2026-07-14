package com.zinema.backend.repository;

import com.zinema.backend.model.Movie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class MovieRepository {

    private final DynamoDbTable<Movie> movieTable;

    public MovieRepository(DynamoDbEnhancedClient enhancedClient,
                           @Value("${aws.dynamodb.movies-table}") String tableName) {
        this.movieTable = enhancedClient.table(tableName, TableSchema.fromBean(Movie.class));
    }

    public void save(Movie movie) {
        movieTable.putItem(movie);
    }

    public Movie findById(String movieId) {
        Key key = Key.builder()
                .partitionValue(movieId)
                .sortValue("METADATA")
                .build();
        return movieTable.getItem(key);
    }

    public List<Movie> findAll() {
        return movieTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public void delete(String movieId) {
        Key key = Key.builder()
                .partitionValue(movieId)
                .sortValue("METADATA")
                .build();
        movieTable.deleteItem(key);
    }
}