/**
 * This is table initializer so that we stop losing data on every LocalStack restart.
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

//    @PostConstruct means it runs automatically when Spring Boot starts
    @PostConstruct
    public void initializeTables() {
        createTableIfNotExists(moviesTable, "movieId", "sk");
        createTableIfNotExists(showtimesTable, "showtimeId", "sk");
        createTableIfNotExists(bookingsTable, "userId", "sk");
        s3Service.createBucketIfNotExists();
        seedMovies();
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
                            .movieId("MOVIE-" + java.util.UUID.randomUUID())
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
                            .movieId("MOVIE-" + java.util.UUID.randomUUID())
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
                            .movieId("MOVIE-" + java.util.UUID.randomUUID())
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
                            .movieId("MOVIE-" + java.util.UUID.randomUUID())
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
                            .movieId("MOVIE-" + java.util.UUID.randomUUID())
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

}