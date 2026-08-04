package com.thecommons.backend.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.thecommons.backend.inventory.dto.CreateInventoryItemRequest;
import com.thecommons.backend.inventory.dto.UpdateInventoryItemRequest;
import com.thecommons.backend.inventory.exception.DuplicateQrCodeException;
import com.thecommons.backend.inventory.exception.InventoryItemNotFoundException;

import java.util.List;
import java.util.Optional;
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
                1);

        when(inventoryRepository.findAll()).thenReturn(List.of(item));

        List<InventoryItem> result = inventoryService.getAllItems();

        assertEquals(1, result.size());
        assertSame(item, result.getFirst());
        verify(inventoryRepository).findAll();
    }

    @Test
    void createItemSavesItemWhenQrCodeIsUnique() {

        CreateInventoryItemRequest request = new CreateInventoryItemRequest(
                "TEST-QR-001",
                "Test table",
                "Furniture",
                "Test organization",
                "Test Location",
                1,
                "Test event",
                true);

        when(inventoryRepository.existsByQrCode("TEST-QR-001")).thenReturn(
                false);
        when(inventoryRepository.save(any(InventoryItem.class))).thenAnswer(
                invocation -> invocation.getArgument(0));

        InventoryItem result = inventoryService.createItem(request);

        assertEquals("TEST-QR-001", result.getQrCode());
        verify(inventoryRepository).existsByQrCode("TEST-QR-001");
        verify(inventoryRepository).save(any(InventoryItem.class));
    }

    @Test
    void createItemThrowsWhenQrCodeAlreadyExists() {
        CreateInventoryItemRequest request = new CreateInventoryItemRequest(
                "TEST-QR-001",
                "Test table",
                "Furniture",
                "Test organization",
                "Test location",
                1,
                "Test event",
                true);

        when(inventoryRepository.existsByQrCode("TEST-QR-001")).thenReturn(
                true);

        assertThrows(DuplicateQrCodeException.class, () -> inventoryService.createItem(request));
        verify(inventoryRepository, never()).save(any(InventoryItem.class));
        verify(inventoryRepository).existsByQrCode("TEST-QR-001");
    }

    @Test
    void getItemByIdReturnsItemWhenFound() {
        InventoryItem item = new InventoryItem(
                "TEST-QR-001",
                "Test Table",
                "Furniture",
                "UGBC",
                "Test Storage",
                1);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(item));

        InventoryItem result = inventoryService.getItemById(1L);

        assertSame(item, result);
        verify(inventoryRepository).findById(1L);
    }

    @Test
    void getItemByIdThrowsWhenItemIsMissing() {

        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(InventoryItemNotFoundException.class, () -> inventoryService.getItemById(1L));
        verify(inventoryRepository).findById(1L);
    }

    @Test
    void updateItemUpdatesAndSavesExistingItem() {
        InventoryItem item = new InventoryItem(
                "TEST-QR-001",
                "Old name",
                "Old category",
                "Old organization",
                "Old location",
                1);

        UpdateInventoryItemRequest request = new UpdateInventoryItemRequest(
                "New name",
                "New category",
                "New organization",
                "New location",
                5,
                "New event",
                true);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(item));
        when(inventoryRepository.save(any(InventoryItem.class))).thenAnswer(
                invocation -> invocation.getArgument(0));

        InventoryItem result = inventoryService.updateItem(1L, request);

        assertSame(item, result);
        assertEquals("New name", result.getName());
        assertEquals("New category", result.getCategory());
        assertEquals("New organization", result.getOrganization());
        assertEquals("New location", result.getLocation());
        assertEquals(5, result.getQuantity());
        assertEquals("New event", result.getLastUsed());
        assertEquals(true, result.isShared());

        verify(inventoryRepository).findById(1L);
        verify(inventoryRepository).save(item);
    }

    @Test
    void updateItemThrowsWhenItemIsMissing() {

        UpdateInventoryItemRequest request = new UpdateInventoryItemRequest(
                "New name",
                "New category",
                "New organization",
                "New location",
                5,
                "New event",
                true);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(InventoryItemNotFoundException.class, () -> inventoryService.updateItem(1L, request));
        verify(inventoryRepository).findById(1L);
        verify(inventoryRepository, never()).save(any(InventoryItem.class));
    }

    @Test
    void deleteItemDeletesExistingItem() {
        InventoryItem item = new InventoryItem(
                "TEST-QR-001",
                "Test Table",
                "Furniture",
                "UGBC",
                "Test Storage",
                1);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(item));

        inventoryService.deleteItem(1L);

        verify(inventoryRepository).findById(1L);
        verify(inventoryRepository).delete(item);
    }

    @Test
    void deleteItemThrowsWhenItemIsMissing() {
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                InventoryItemNotFoundException.class,
                () -> inventoryService.deleteItem(1L));

        verify(inventoryRepository).findById(1L);
        verify(inventoryRepository, never()).delete(any(InventoryItem.class));
    }
}
