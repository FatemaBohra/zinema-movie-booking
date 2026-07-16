/**
 * This is table initializer so that we stop losing data on every LocalStack restart.
 *
 * TMDB (The Movie Database):
 * Free API at themoviedb.org
 * Has movie titles, descriptions, genres, directors, ratings, and real poster images
 * Very generous free tier — 40 requests per second
 * Used by many real apps
 *
 * The plan for Zinema:
 * Call TMDB API on startup to fetch popular movies
 * Save them to DynamoDB with real poster URLs from TMDB
 * Keep your admin panel for editing and deleting
 * */

package com.zinema.backend.config;

import com.zinema.backend.service.S3Service;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AwsInitializer {

    private final DynamoDbClient dynamoDbClient;
    private final S3Service s3Service;

    @Value("${aws.dynamodb.movies-table}")
    private String moviesTable;

    @Value("${aws.dynamodb.showtimes-table}")
    private String showtimesTable;

    @Value("${aws.dynamodb.bookings-table}")
    private String bookingsTable;

    private static final String INCEPTION_ID = "MOVIE-inception";
    private static final String DARK_KNIGHT_ID = "MOVIE-dark-knight";
    private static final String INTERSTELLAR_ID = "MOVIE-interstellar";
    private static final String DUNE_ID = "MOVIE-dune";
    private static final String PARASITE_ID = "MOVIE-parasite";

//    @PostConstruct means it runs automatically when Spring Boot starts
    @PostConstruct
    public void initializeTables() {
        createTableIfNotExists(moviesTable, "movieId", "sk");
        createTableIfNotExists(showtimesTable, "showtimeId", "sk");
        createTableIfNotExists(bookingsTable, "userId", "sk");
        s3Service.createBucketIfNotExists();
        seedMovies();
        seedShowtimes();
    }

    private void createTableIfNotExists(String tableName, String partitionKey, String sortKey) {
        try {
            dynamoDbClient.describeTable(r -> r.tableName(tableName));
            System.out.println("Table already exists: " + tableName);
        } catch (ResourceNotFoundException e) {
            dynamoDbClient.createTable(CreateTableRequest.builder()
                    .tableName(tableName)
                    .attributeDefinitions(
                            AttributeDefinition.builder()
                                    .attributeName(partitionKey)
                                    .attributeType(ScalarAttributeType.S)
                                    .build(),
                            AttributeDefinition.builder()
                                    .attributeName(sortKey)
                                    .attributeType(ScalarAttributeType.S)
                                    .build()
                    )
                    .keySchema(
                            KeySchemaElement.builder()
                                    .attributeName(partitionKey)
                                    .keyType(KeyType.HASH)
                                    .build(),
                            KeySchemaElement.builder()
                                    .attributeName(sortKey)
                                    .keyType(KeyType.RANGE)
                                    .build()
                    )
                    .billingMode(BillingMode.PAY_PER_REQUEST)
                    .build());
            System.out.println("Created table: " + tableName);
        }
    }

    private void seedMovies() {
        try {
            // Check if movies already exist
            software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient enhancedClient =
                    software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient.builder()
                            .dynamoDbClient(dynamoDbClient)
                            .build();

            software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable<com.zinema.backend.model.Movie> movieTable =
                    enhancedClient.table(moviesTable,
                            software.amazon.awssdk.enhanced.dynamodb.TableSchema
                                    .fromBean(com.zinema.backend.model.Movie.class));

            long count = movieTable.scan().items().stream().count();
            if (count > 0) {
                System.out.println("Movies already seeded, skipping...");
                return;
            }

            // Seed movies
            List<com.zinema.backend.model.Movie> movies = List.of(
                    com.zinema.backend.model.Movie.builder()
                            .movieId(INCEPTION_ID)
                            .sk("METADATA")
                            .title("Inception")
                            .description("A thief who steals corporate secrets through dream-sharing technology")
                            .genre("Sci-Fi")
                            .director("Christopher Nolan")
                            .durationMinutes(148)
                            .releaseDate("2010-07-16")
                            .rating(8.8)
                            .build(),
                    com.zinema.backend.model.Movie.builder()
                            .movieId(DARK_KNIGHT_ID)
                            .sk("METADATA")
                            .title("The Dark Knight")
                            .description("Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy")
                            .genre("Action")
                            .director("Christopher Nolan")
                            .durationMinutes(152)
                            .releaseDate("2008-07-18")
                            .rating(9.0)
                            .build(),
                    com.zinema.backend.model.Movie.builder()
                            .movieId(INTERSTELLAR_ID)
                            .sk("METADATA")
                            .title("Interstellar")
                            .description("A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival")
                            .genre("Sci-Fi")
                            .director("Christopher Nolan")
                            .durationMinutes(169)
                            .releaseDate("2014-11-07")
                            .rating(8.6)
                            .build(),
                    com.zinema.backend.model.Movie.builder()
                            .movieId(DUNE_ID)
                            .sk("METADATA")
                            .title("Dune")
                            .description("A noble family becomes embroiled in a war for control over the galaxy's most valuable asset")
                            .genre("Sci-Fi")
                            .director("Denis Villeneuve")
                            .durationMinutes(155)
                            .releaseDate("2021-10-22")
                            .rating(8.0)
                            .build(),
                    com.zinema.backend.model.Movie.builder()
                            .movieId(PARASITE_ID)
                            .sk("METADATA")
                            .title("Parasite")
                            .description("Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan")
                            .genre("Thriller")
                            .director("Bong Joon-ho")
                            .durationMinutes(132)
                            .releaseDate("2019-05-30")
                            .rating(8.5)
                            .build()
            );

            movies.forEach(movieTable::putItem);
            System.out.println("Seeded " + movies.size() + " movies!");

        } catch (Exception e) {
            System.out.println("Error seeding movies: " + e.getMessage());
        }
    }
    private void seedShowtimes() {
        try {
            software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient enhancedClient =
                    software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient.builder()
                            .dynamoDbClient(dynamoDbClient)
                            .build();

            software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable<com.zinema.backend.model.Showtime> showtimeTable =
                    enhancedClient.table(showtimesTable,
                            software.amazon.awssdk.enhanced.dynamodb.TableSchema
                                    .fromBean(com.zinema.backend.model.Showtime.class));

            long count = showtimeTable.scan().items().stream().count();
            if (count > 0) {
                System.out.println("Showtimes already seeded, skipping...");
                return;
            }

            List<com.zinema.backend.model.Showtime> showtimes = List.of(
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-inception-1")
                            .sk("METADATA")
                            .movieId(INCEPTION_ID)
                            .startTime("2026-07-20T14:00:00")
                            .endTime("2026-07-20T16:28:00")
                            .hall("Hall A")
                            .totalSeats(100)
                            .availableSeats(100)
                            .ticketPrice(12.99)
                            .build(),
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-inception-2")
                            .sk("METADATA")
                            .movieId(INCEPTION_ID)
                            .startTime("2026-07-20T19:30:00")
                            .endTime("2026-07-20T21:58:00")
                            .hall("Hall B")
                            .totalSeats(80)
                            .availableSeats(80)
                            .ticketPrice(14.99)
                            .build(),
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-dark-knight-1")
                            .sk("METADATA")
                            .movieId(DARK_KNIGHT_ID)
                            .startTime("2026-07-20T15:00:00")
                            .endTime("2026-07-20T17:32:00")
                            .hall("Hall A")
                            .totalSeats(100)
                            .availableSeats(100)
                            .ticketPrice(12.99)
                            .build(),
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-dark-knight-2")
                            .sk("METADATA")
                            .movieId(DARK_KNIGHT_ID)
                            .startTime("2026-07-20T20:00:00")
                            .endTime("2026-07-20T22:32:00")
                            .hall("Hall C")
                            .totalSeats(120)
                            .availableSeats(120)
                            .ticketPrice(14.99)
                            .build(),
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-interstellar-1")
                            .sk("METADATA")
                            .movieId(INTERSTELLAR_ID)
                            .startTime("2026-07-21T18:00:00")
                            .endTime("2026-07-21T20:49:00")
                            .hall("Hall B")
                            .totalSeats(80)
                            .availableSeats(80)
                            .ticketPrice(12.99)
                            .build(),
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-dune-1")
                            .sk("METADATA")
                            .movieId(DUNE_ID)
                            .startTime("2026-07-21T20:00:00")
                            .endTime("2026-07-21T22:35:00")
                            .hall("Hall A")
                            .totalSeats(100)
                            .availableSeats(100)
                            .ticketPrice(14.99)
                            .build(),
                    com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-parasite-1")
                            .sk("METADATA")
                            .movieId(PARASITE_ID)
                            .startTime("2026-07-22T19:00:00")
                            .endTime("2026-07-22T21:12:00")
                            .hall("Hall C")
                            .totalSeats(120)
                            .availableSeats(120)
                            .ticketPrice(12.99)
                            .build()
            );

            showtimes.forEach(showtimeTable::putItem);
            System.out.println("Seeded " + showtimes.size() + " showtimes!");

        } catch (Exception e) {
            System.out.println("Error seeding showtimes: " + e.getMessage());
        }
    }

}