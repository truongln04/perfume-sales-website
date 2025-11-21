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
public class MomoResponse {
    @JsonProperty("partnerCode")
    private String partnerCode;

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("requestId")
    private String requestId;

    @JsonProperty("amount")
    private long amount;

    @JsonProperty("payUrl")
    private String payUrl;              // ← Link thanh toán chính

    @JsonProperty("deeplink")
    private String deeplink;

    @JsonProperty("qrCodeUrl")
    private String qrCodeUrl;

    @JsonProperty("resultCode")
    private int resultCode;             // 0 = thành công

    @JsonProperty("message")
    private String message;

    @JsonProperty("signature")
    private String signature;

}
