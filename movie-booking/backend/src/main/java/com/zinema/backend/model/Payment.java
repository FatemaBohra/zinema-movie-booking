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
public class Payment {

    @Getter(onMethod_ = {@DynamoDbPartitionKey})
    private String paymentId;      // partition key e.g. "PAYMENT#xyz789"

    @Getter(onMethod_ = {@DynamoDbSortKey})
    private String sk;             // sort key e.g. "METADATA"

    private String userId;
    private String bookingId;
    private double amount;
    private String currency;       // e.g. "CAD"
    private String status;         // SUCCEEDED, FAILED, PENDING
    private String stripePaymentIntentId;
    private String createdAt;
}