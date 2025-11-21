package com.example.perfumeshop.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class MomoRequest {
    @JsonProperty("amount")
    private int amount;

    @JsonProperty("orderInfo")
    private String orderInfo;

    @JsonProperty("extraData")
    private String extraData;
}
