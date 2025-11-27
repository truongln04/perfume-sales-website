package com.example.perfumeshop.service;


import com.example.perfumeshop.repository.DashboardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("taiKhoan", dashboardRepository.countTaiKhoan());
        stats.put("sanPham", dashboardRepository.countSanPham());
        stats.put("donHangMoi", dashboardRepository.countDonHangMoi());
        stats.put("doanhThu", dashboardRepository.sumDoanhThu());
        return stats;
    }
}
