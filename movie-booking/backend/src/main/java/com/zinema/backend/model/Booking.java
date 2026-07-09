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
public class Booking {

    @Getter(onMethod_ = {@DynamoDbPartitionKey})
    private String userId;         // partition key e.g. "USER#fatema123"

    @Getter(onMethod_ = {@DynamoDbSortKey})
    private String sk;             // sort key e.g. "BOOKING#abc123"

    private String bookingId;
    private String movieId;
    private String showtimeId;
    private String seatId;
    private String status;         // CONFIRMED, CANCELLED, PENDING
    private String paymentId;
    private String createdAt;
    private double totalAmount;
}