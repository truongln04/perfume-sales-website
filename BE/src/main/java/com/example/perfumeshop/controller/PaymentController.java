package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.MomoPayload;
import com.example.perfumeshop.dto.MomoRequest;
import com.example.perfumeshop.dto.MomoResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.codec.binary.Hex;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "http://localhost:5173") // cho React chạy port 3000
public class PaymentController {

    private static final String PARTNER_CODE = "MOMO";
    private static final String ACCESS_KEY = "F8BBA842ECF85";
    private static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    private static final String MOMO_API_URL = "https://test-payment.momo.vn/v2/gateway/api/create";

    @PostMapping("/momo")
    public ResponseEntity<MomoResponse> createMomoPayment(
            @RequestBody MomoRequest req,
            HttpServletRequest request) {

        String orderId = "DH" + System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();

        String redirectUrl = "http://localhost:5173/client/payment/momo-return";  // trang React của bạn
        String ipnUrl = "http://localhost:8081/payment/momo-ipn";      // backend nhận thông báo

        String rawSignature = "accessKey=" + ACCESS_KEY +
                "&amount=" + req.getAmount() +
                "&extraData=" + req.getExtraData() +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + req.getOrderInfo() +
                "&partnerCode=" + PARTNER_CODE +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=payWithMethod";

        String signature = hmacSHA256(rawSignature, SECRET_KEY);

        MomoPayload payload = MomoPayload.builder()
                .partnerCode(PARTNER_CODE)
                .accessKey(ACCESS_KEY)
                .requestId(requestId)
                .amount(String.valueOf(req.getAmount()))
                .orderId(orderId)
                .orderInfo(req.getOrderInfo())
                .redirectUrl(redirectUrl)
                .ipnUrl(ipnUrl)
                .extraData(req.getExtraData())
                .requestType("payWithMethod")
                .signature(signature)
                .build();

        RestTemplate restTemplate = new RestTemplate();
        MomoResponse momoResponse = restTemplate.postForObject(MOMO_API_URL, payload, MomoResponse.class);

        return ResponseEntity.ok(momoResponse);
    }

    // Hàm tạo chữ ký HMAC SHA256
    private String hmacSHA256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            return Hex.encodeHexString(sha256_HMAC.doFinal(data.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC", e);
        }
    }
}