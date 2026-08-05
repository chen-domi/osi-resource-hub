package com.thecommons.backend.inventory.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckOutInventoryItemRequest(
        @NotBlank String purpose,
        @NotNull @FutureOrPresent LocalDate dueDate) {
}
