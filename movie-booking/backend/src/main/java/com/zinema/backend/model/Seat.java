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
public class Seat {

    @Getter(onMethod_ = {@DynamoDbPartitionKey})
    private String showtimeId;     // partition key e.g. "SHOWTIME#abc123"

    @Getter(onMethod_ = {@DynamoDbSortKey})
    private String sk;             // sort key e.g. "SEAT#C4"

    private String seatId;         // e.g. "C4"
    private String row;            // e.g. "C"
    private int number;            // e.g. 4
    private String status;         // AVAILABLE, RESERVED, BOOKED
    private String bookedByUserId; // null if available
}