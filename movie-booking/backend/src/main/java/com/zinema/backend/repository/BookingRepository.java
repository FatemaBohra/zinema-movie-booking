package com.zinema.backend.repository;

import com.zinema.backend.model.Booking;
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
public class BookingRepository {

    private final DynamoDbTable<Booking> bookingTable;

    public BookingRepository(DynamoDbEnhancedClient enhancedClient,
                             @Value("${aws.dynamodb.bookings-table}") String tableName) {
        this.bookingTable = enhancedClient.table(tableName, TableSchema.fromBean(Booking.class));
    }

    public void save(Booking booking) {
        bookingTable.putItem(booking);
    }

    public Booking findById(String userId, String sk) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(sk)
                .build();
        return bookingTable.getItem(key);
    }

    public List<Booking> findByUserId(String userId) {
        return bookingTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(b -> b.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public List<Booking> findAll() {
        return bookingTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public void delete(String userId, String sk) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(sk)
                .build();
        bookingTable.deleteItem(key);
    }
}