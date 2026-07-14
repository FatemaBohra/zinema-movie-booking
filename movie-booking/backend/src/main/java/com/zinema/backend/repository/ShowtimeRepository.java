package com.zinema.backend.repository;

import com.zinema.backend.model.Showtime;
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
public class ShowtimeRepository {

    private final DynamoDbTable<Showtime> showtimeTable;

    public ShowtimeRepository(DynamoDbEnhancedClient enhancedClient,
                              @Value("${aws.dynamodb.table-name}") String tableName) {
        this.showtimeTable = enhancedClient.table(tableName, TableSchema.fromBean(Showtime.class));
    }

    public void save(Showtime showtime) {
        showtimeTable.putItem(showtime);
    }

    public Showtime findById(String showtimeId) {
        Key key = Key.builder()
                .partitionValue(showtimeId)
                .sortValue("METADATA")
                .build();
        return showtimeTable.getItem(key);
    }

    public List<Showtime> findAll() {
        return showtimeTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public void delete(String showtimeId) {
        Key key = Key.builder()
                .partitionValue(showtimeId)
                .sortValue("METADATA")
                .build();
        showtimeTable.deleteItem(key);
    }
}