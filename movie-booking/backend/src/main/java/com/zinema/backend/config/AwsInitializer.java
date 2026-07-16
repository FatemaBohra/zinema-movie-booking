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
 *
 *
 * TMDB total calls right now:
 * 1 call  → fetch popular movies list
 * 1 call  → fetch genre list
 * 10 calls → fetch credits for each of 10 movies (1 per movie)
 * ─────────────────────────────────────────────
 * 12 calls total
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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    @Value("${tmdb.api-key}")
    private String tmdbApiKey;

    private final ObjectMapper objectMapper;

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

            // Fetch popular movies from TMDB
            String url = "https://api.themoviedb.org/3/movie/popular?api_key=" + tmdbApiKey + "&language=en-US&page=1";
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(url))
                    .GET()
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            // Fetch GENRE mapping from TMDB (The Movie DataBase)
            String genreUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key=" + tmdbApiKey + "&language=en-US";
            java.net.http.HttpRequest genreRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(genreUrl))
                    .GET()
                    .build();
            java.net.http.HttpResponse<String> genreResponse = client.send(genreRequest,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            JsonNode genreRoot = objectMapper.readTree(genreResponse.body());
            java.util.Map<Integer, String> genreMap = new java.util.HashMap<>();
            for (JsonNode genre : genreRoot.get("genres")) {
                genreMap.put(genre.get("id").asInt(), genre.get("name").asText());
            }

            // Parse JSON response - using injected objectMapper instead of creating new one
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode results = root.get("results");

            int count2 = 0;
            for (JsonNode movie : results) {
                if (count2 >= 10) break;

                String movieId = "MOVIE-" + java.util.UUID.randomUUID();
                JsonNode posterNode = movie.get("poster_path");
                String posterUrl = (posterNode == null || posterNode.isNull()) ? null :
                        "https://image.tmdb.org/t/p/w500" + posterNode.asText();

                // Get genre name from genre_ids array
                JsonNode genreIds = movie.get("genre_ids");
                String genre = "Unknown";
                if (genreIds != null && genreIds.isArray() && genreIds.size() > 0) {
                    int genreId = genreIds.get(0).asInt();
                    genre = genreMap.getOrDefault(genreId, "Unknown");
                }

                // Fetch director from TMDB credits endpoint
                // a separate API call per movie to the credits endpoint.
                String director = "Unknown";
                try {
                    String creditsUrl = "https://api.themoviedb.org/3/movie/" + movie.get("id").asInt() + "/credits?api_key=" + tmdbApiKey;
                    java.net.http.HttpRequest creditsRequest = java.net.http.HttpRequest.newBuilder()
                            .uri(java.net.URI.create(creditsUrl))
                            .GET()
                            .build();
                    java.net.http.HttpResponse<String> creditsResponse = client.send(creditsRequest,
                            java.net.http.HttpResponse.BodyHandlers.ofString());
                    JsonNode creditsRoot = objectMapper.readTree(creditsResponse.body());
                    JsonNode crew = creditsRoot.get("crew");
                    for (JsonNode member : crew) {
                        if ("Director".equals(member.get("job").asText())) {
                            director = member.get("name").asText();
                            break;
                        }
                    }
                } catch (Exception e) {
                    System.out.println("Could not fetch director for movie: " + movie.get("title").asText());
                }

                com.zinema.backend.model.Movie m = com.zinema.backend.model.Movie.builder()
                        .movieId(movieId)
                        .sk("METADATA")
                        .title(movie.get("title").asText())
                        .description(movie.get("overview").asText())
                        .genre(genre)  // uses real genre name
                        .director(director) // uses director name
                        .durationMinutes(120)
                        .releaseDate(movie.get("release_date").asText())
                        .rating(movie.get("vote_average").asDouble())
                        .posterUrl(posterUrl)
                        .build();

                movieTable.putItem(m);
                count2++;
            }

            System.out.println("Seeded " + count2 + " movies from TMDB!");

        } catch (Exception e) {
            System.out.println("Error seeding movies from TMDB: " + e.getMessage());
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

            // Get movies from table
            software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable<com.zinema.backend.model.Movie> movieTable =
                    enhancedClient.table(moviesTable,
                            software.amazon.awssdk.enhanced.dynamodb.TableSchema
                                    .fromBean(com.zinema.backend.model.Movie.class));

            List<com.zinema.backend.model.Movie> movies = movieTable.scan().items().stream()
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());

            String[] halls = {"Hall A", "Hall B", "Hall C"};
            String[] times = {"14:00:00", "17:00:00", "19:30:00", "21:00:00"};
            double[] prices = {12.99, 14.99};

            int showtimeCount = 0;
            for (com.zinema.backend.model.Movie movie : movies) {
                for (int i = 0; i < 2; i++) {
                    com.zinema.backend.model.Showtime showtime = com.zinema.backend.model.Showtime.builder()
                            .showtimeId("SHOWTIME-" + java.util.UUID.randomUUID())
                            .sk("METADATA")
                            .movieId(movie.getMovieId())
                            .startTime("2026-07-20T" + times[i])
                            .endTime("2026-07-20T" + times[i + 1])
                            .hall(halls[i % 3])
                            .totalSeats(100)
                            .availableSeats(100)
                            .ticketPrice(prices[i % 2])
                            .build();

                    showtimeTable.putItem(showtime);
                    showtimeCount++;
                }
            }

            System.out.println("Seeded " + showtimeCount + " showtimes!");

        } catch (Exception e) {
            System.out.println("Error seeding showtimes: " + e.getMessage());
        }
    }

}