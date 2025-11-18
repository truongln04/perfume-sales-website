// package com.example.perfumeshop.controller;
// import com.example.perfumeshop.service.StatisticalService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import java.util.List;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/statistical")
// @RequiredArgsConstructor
// public class StatisticalController {
//     private final StatisticalService service;

//     @GetMapping("/doanh-thu")
//     public List<Map<String,Object>> revenueByDay(@RequestParam(required=false) String fromDate,
//                                                  @RequestParam(required=false) String toDate) {
//         return service.getRevenueByDay(fromDate, toDate);
//     }

//     @GetMapping("/doanh-thu-san-pham")
//     public List<Map<String,Object>> revenueByProduct(@RequestParam(required=false) String fromDate,
//                                                      @RequestParam(required=false) String toDate) {
//         return service.getRevenueByProduct(fromDate, toDate);
//     }

//     @GetMapping("/top-ban-chay")
//     public List<Map<String,Object>> topSelling(@RequestParam(required=false) String fromDate,
//                                                @RequestParam(required=false) String toDate,
//                                                @RequestParam(defaultValue="10") int limit) {
//         return service.getTopSellingProducts(fromDate, toDate, limit);
//     // 3. Tồn kho
//     @GetMapping("/ton-kho")
//     public List<Map<String,Object>> stockImportExport(@RequestParam(required=false) String fromDate,
//                                                       @RequestParam(required=false) String toDate) {
//         return service.getStockImportExport(fromDate, toDate);
//     }

//     // 4. Đơn hàng theo trạng thái
//     @GetMapping("/don-hang-trang-thai")
//     public List<Map<String,Object>> ordersByStatus(@RequestParam(required=false) String fromDate,
//                                                    @RequestParam(required=false) String toDate) {
//         return service.getOrdersByStatus(fromDate, toDate);
//     }
// }

