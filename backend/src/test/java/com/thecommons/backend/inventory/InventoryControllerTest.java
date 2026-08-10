package com.thecommons.backend.inventory;

import com.thecommons.backend.inventory.exception.InventoryItemNotFoundException;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(InventoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InventoryService inventoryService;

    @Test
    void getAllItemsReturnsOkAndItems() throws Exception {
        InventoryItem item = new InventoryItem(
                "TEST-QR-001",
                "Test Table",
                "Furniture",
                "UGBC",
                "Test Storage",
                1);

        when(inventoryService.getAllItems()).thenReturn(List.of(item));

        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].qrCode").value("TEST-QR-001"))
                .andExpect(jsonPath("$[0].name").value("Test Table"));

        verify(inventoryService).getAllItems();
    }

    @Test
    void getItemByIdReturnsOkAndItem() throws Exception {
        InventoryItem item = new InventoryItem(
                "TEST-QR-001",
                "Test Table",
                "Furniture",
                "UGBC",
                "Test Storage",
                1);

        when(inventoryService.getItemById(1L)).thenReturn(item);

        mockMvc.perform(get("/api/inventory/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qrCode").value("TEST-QR-001"))
                .andExpect(jsonPath("$.name").value("Test Table"));

        verify(inventoryService).getItemById(1L);
    }

    @Test
    void getItemByIdReturnsNotFoundWhenItemIsMissing() throws Exception {
        when(inventoryService.getItemById(99L))
                .thenThrow(new InventoryItemNotFoundException(99L));

        mockMvc.perform(get("/api/inventory/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code")
                        .value("INVENTORY_ITEM_NOT_FOUND"))
                .andExpect(jsonPath("$.message")
                        .value("Inventory item with ID 99 was not found"));

        verify(inventoryService).getItemById(99L);
    }
}
