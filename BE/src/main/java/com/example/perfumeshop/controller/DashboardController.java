package com.example.perfumeshop.controller;

import com.example.perfumeshop.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return dashboardService.getDashboardStats();
    }
}
