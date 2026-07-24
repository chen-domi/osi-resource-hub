package com.thecommons.backend.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void getAllItemsReturnsRepositoryItems() {
        InventoryItem item = new InventoryItem(
            "TEST-QR-001",
            "Test Table",
            "Furniture",
            "UGBC",
            "Test Storage",
            1
        );

        when(inventoryRepository.findAll()).thenReturn(List.of(item));

        List<InventoryItem> result = inventoryService.getAllItems();

        assertEquals(1, result.size());
        assertSame(item, result.getFirst());
        verify(inventoryRepository).findAll();
    }

    @Test
    void createItemSavesItemWhenQrCodeIsUnique() {
        //Arrange

        //Act

        //Assert
    }

    
}
