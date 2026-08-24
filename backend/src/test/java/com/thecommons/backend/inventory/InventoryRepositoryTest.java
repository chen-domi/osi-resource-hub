package com.thecommons.backend.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@SpringBootTest
@Testcontainers
@Transactional
class InventoryRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private InventoryRepository inventoryRepository;

    @Test
    void savesAndFindsItemById() {
        InventoryItem savedItem = inventoryRepository.saveAndFlush(testItem());

        InventoryItem foundItem = inventoryRepository
                .findById(savedItem.getId())
                .orElseThrow();

        assertThat(foundItem.getId()).isEqualTo(savedItem.getId());
        assertThat(foundItem.getQrCode()).isEqualTo("TEST-QR-001");
        assertThat(foundItem.getCreatedAt()).isNotNull();
    }

    @Test
    void findsItemByQrCode() {
        inventoryRepository.saveAndFlush(testItem());

        InventoryItem foundItem = inventoryRepository
                .findByQrCode("TEST-QR-001")
                .orElseThrow();

        assertThat(foundItem.getName()).isEqualTo("Test Table");
    }

    @Test
    void reportsWhenQrCodeExists() {
        inventoryRepository.saveAndFlush(testItem());

        boolean exists = inventoryRepository.existsByQrCode("TEST-QR-001");

        assertThat(exists).isTrue();
    }

    @Test
    void rejectsDuplicateQrCodes() {
        inventoryRepository.saveAndFlush(testItem());

        InventoryItem duplicate = new InventoryItem(
                "TEST-QR-001",
                "Another Table",
                "Furniture",
                "UGBC",
                "Another Storage Room",
                1);

        assertThatThrownBy(() -> inventoryRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private InventoryItem testItem() {
        return new InventoryItem(
                "TEST-QR-001",
                "Test Table",
                "Furniture",
                "UGBC",
                "Test Storage",
                1);
    }
}
