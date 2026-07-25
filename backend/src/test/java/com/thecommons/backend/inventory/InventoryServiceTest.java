package com.thecommons.backend.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;


import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.thecommons.backend.inventory.dto.CreateInventoryItemRequest;

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
        //Arrange: Prepare the request and tell the fake repo how to behave
        //Act: Call createItem()
        //Assert: Check what happened

        CreateInventoryItemRequest request = new CreateInventoryItemRequest(
            "TEST-QR-001",
            "Test table",
            "Furniture",
            "Test organization",
            "Test Location",
            1,
            "Test event",
            true
        );

        when(inventoryRepository.existsByQrCode("TEST-QR-001")).thenReturn(false); 
        when(inventoryRepository.save(any(InventoryItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
   
        InventoryItem result = inventoryService.createItem(request);

        assertEquals("TEST-QR-001", result.getQrCode());
        verify(inventoryRepository).existsByQrCode("TEST-QR-001");
        verify(inventoryRepository).save(any(InventoryItem.class));
    }
}
