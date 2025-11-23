package com.example.perfumeshop.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "don_hang")
@Getter  // ← Thay @Data bằng các cái riêng
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"chiTietDonHang", "taiKhoan"})  // ← LOẠI TRỪ 2 FIELD NÀY KHỎI toString()
@EqualsAndHashCode(exclude = {"chiTietDonHang", "taiKhoan"})  // ← LOẠI TRỪ KHỎI equals()/hashCode()
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_don_hang")
    private Integer id;

    @ManyToOne
    @JoinColumn(
        name = "id_tai_khoan", 
        referencedColumnName = "id_tai_khoan",
        foreignKey = @ForeignKey(name = "fk_donhang_taikhoan")
    )
    @JsonBackReference
    private Account taiKhoan;

    @Column(name = "ngay_dat", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime ngayDat;

    @Column(name = "tong_tien", precision = 14, scale = 0)
    private BigDecimal tongTien;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc_tt", length = 10)
    private PaymentMethod phuongThucTT = PaymentMethod.COD;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai_tt", length = 20)
    private PaymentStatus trangThaiTT = PaymentStatus.CHUA_THANH_TOAN;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    private OrderStatus trangThai = OrderStatus.CHO_XAC_NHAN;

    @Column(name = "ho_ten_nhan", length = 100)
    private String hoTenNhan;

    @Column(name = "sdt_nhan", length = 15)
    private String sdtNhan;

    @Column(name = "dia_chi_giao", length = 255)
    private String diaChiGiao;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonManagedReference
    private List<OrdersDetail> chiTietDonHang = new ArrayList<>();

    // 🧾 Enum nội bộ
    public enum PaymentMethod {
        COD, ONLINE
    }
// @Enumerated(EnumType.STRING)
//     private PaymentStatus trangThaiThanhToan; // thêm field này

    public enum PaymentStatus {
        CHUA_THANH_TOAN("Chưa thanh toán"),
        DA_THANH_TOAN("Đã thanh toán"),
        HOAN_TIEN("Hoàn tiền"),
        DA_HOAN_TIEN("Đã hoàn tiền");

        private final String value;
        PaymentStatus(String value) { this.value = value; }
        public String getValue() { return value; }
    }

    public enum OrderStatus {
        CHO_XAC_NHAN("Chờ xác nhận"),
        DA_XAC_NHAN("Đã xác nhận"),
        DANG_GIAO("Đang giao"),
        HOAN_THANH("Hoàn thành"),
        TRA_HANG("Trả hàng"),
        HUY("Hủy");

        private final String value;
        OrderStatus(String value) { this.value = value; }
        public String getValue() { return value; }
    }
}