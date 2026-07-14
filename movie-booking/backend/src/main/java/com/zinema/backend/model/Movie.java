/**
 * note:
 * @DynamoDbBean tells the AWS SDK this class maps to a DynamoDB table
 * @Data from Lombok auto-generates getters, setters, equals, hashCode
 * @Builder lets you create objects cleanly like Movie.builder().title("Inception").build()
 * The partition key + sort key pattern follows single-table design
 * @Getter(onMethod_ = {@DynamoDbPartitionKey}): it tells Lombok to add the @DynamoDbPartitionKey
 * annotation onto the generated getter, which is what the AWS SDK needs.
 * */
package com.zinema.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class Movie {

    @Getter(onMethod_ = {@DynamoDbPartitionKey})
    private String movieId;        // partition key e.g. "MOVIE#inception"

    @Getter(onMethod_ = {@DynamoDbSortKey})
    private String sk;             // sort key e.g. "METADATA"

    private String title;
    private String description;
    private String genre;
    private String director;
    private Integer durationMinutes;
    private String posterUrl;      // S3 URL
    private String releaseDate;
    private double rating;
}