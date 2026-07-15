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

    @PostConstruct
    public void initializeTables() {
        createTableIfNotExists(moviesTable, "movieId", "sk");
        createTableIfNotExists(showtimesTable, "showtimeId", "sk");
        createTableIfNotExists(bookingsTable, "userId", "sk");
        s3Service.createBucketIfNotExists();
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
}