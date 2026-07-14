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
public class Showtime {

    @Getter(onMethod_ = {@DynamoDbPartitionKey})
    private String showtimeId;     // partition key e.g. "SHOWTIME-abc123"

    @Getter(onMethod_ = {@DynamoDbSortKey})
    private String sk;             // sort key e.g. "METADATA"

    private String movieId;        // links to Movie
    private String startTime;      // e.g. "2026-07-15T19:30:00"
    private String endTime;        // e.g. "2026-07-15T22:00:00"
    private String hall;           // e.g. "Hall A"
    private Integer totalSeats;        // e.g. 100
    private Integer availableSeats;    // decrements as bookings are made
    private double ticketPrice;    // e.g. 12.99
}