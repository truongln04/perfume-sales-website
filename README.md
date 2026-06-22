# 🌸 Perfume Sales Website

Hệ thống bán nước hoa trực tuyến được phát triển theo mô hình Full Stack với ReactJS, Spring Boot và MySQL. Website cung cấp trải nghiệm mua sắm hiện đại, cho phép khách hàng tìm kiếm sản phẩm, quản lý giỏ hàng, đặt hàng trực tuyến và theo dõi đơn hàng. Đồng thời, hệ thống hỗ trợ quản trị viên quản lý sản phẩm, người dùng và doanh thu hiệu quả.

## 📖 Giới thiệu

Perfume Sales Website là một nền tảng thương mại điện tử chuyên kinh doanh nước hoa, được xây dựng nhằm số hóa quy trình bán hàng và nâng cao trải nghiệm mua sắm trực tuyến.

Hệ thống được thiết kế theo kiến trúc tách biệt Frontend và Backend:

* Frontend: ReactJS
* Backend: Spring Boot REST API
* Database: MySQL

## 🎯 Mục tiêu

* Xây dựng website bán nước hoa hiện đại, thân thiện với người dùng.
* Áp dụng mô hình RESTful API trong phát triển ứng dụng.
* Hỗ trợ quản lý sản phẩm, đơn hàng và khách hàng.
* Tăng cường trải nghiệm mua sắm trực tuyến.

---

# ✨ Chức năng chính

## 👤 Khách hàng

* Đăng ký tài khoản.
* Đăng nhập / Đăng xuất.
* Xem danh sách sản phẩm.
* Xem chi tiết sản phẩm.
* Tìm kiếm sản phẩm.
* Lọc sản phẩm theo danh mục hoặc thương hiệu.
* Thêm sản phẩm vào giỏ hàng.
* Cập nhật số lượng sản phẩm trong giỏ hàng.
* Đặt hàng trực tuyến.
* Theo dõi trạng thái đơn hàng.
* Xem lịch sử mua hàng.
* Cập nhật thông tin cá nhân.

## 🔑 Quản trị viên

* Quản lý sản phẩm (CRUD).
* Quản lý danh mục sản phẩm.
* Quản lý thương hiệu.
* Quản lý người dùng.
* Quản lý đơn hàng.
* Thống kê doanh thu.
* Quản lý hệ thống.

---

# 🏗️ Kiến trúc hệ thống

```text
Client (ReactJS)
        │
        ▼
REST API (Spring Boot)
        │
        ▼
      MySQL
```

Frontend giao tiếp với Backend thông qua REST API. Backend xử lý nghiệp vụ, xác thực người dùng và thao tác với cơ sở dữ liệu MySQL.

---

# 🛠️ Công nghệ sử dụng

## Frontend

* ReactJS
* React Router DOM
* Axios
* Bootstrap / CSS
* JavaScript ES6

## Backend

* Java Spring Boot
* Spring MVC
* Spring Data JPA
* Spring Security
* JWT Authentication
* Maven

## Database

* MySQL

## Công cụ phát triển

* IntelliJ IDEA
* Visual Studio Code
* MySQL Workbench
* Postman
* Git & GitHub

---

# 📂 Cấu trúc dự án

```text
perfume-sales-website/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── layouts/
│   │   └── App.js
│
├── backend/
│   ├── src/main/java/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── config/
│   │   └── security/
│   │
│   └── src/main/resources/
│       └── application.properties
│
└── README.md
```

---

# ⚙️ Cài đặt và chạy dự án

## 1. Clone repository

```bash
git clone https://github.com/truongln04/perfume-sales-website.git
cd perfume-sales-website
```

## 2. Chạy Backend

```bash
cd backend
```

Cấu hình cơ sở dữ liệu trong:

```properties
application.properties
```

Ví dụ:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/perfume_shop
spring.datasource.username=root
spring.datasource.password=123456
```

Chạy ứng dụng:

```bash
mvn spring-boot:run
```

Backend chạy tại:

```text
http://localhost:8080
```

---

## 3. Chạy Frontend

```bash
cd frontend
npm install
npm start
```

Frontend chạy tại:

```text
http://localhost:3000
```

---


# 📈 Tính năng nổi bật

* Giao diện Responsive trên nhiều thiết bị.
* Hệ thống xác thực JWT.
* Quản lý giỏ hàng trực quan.
* Tìm kiếm và lọc sản phẩm nhanh chóng.
* Quản lý đơn hàng hiệu quả.
* Thống kê doanh thu cho quản trị viên.

---

# 🚀 Hướng phát triển

* Tích hợp thanh toán VNPay.
* Tích hợp thanh toán MoMo.
* Đánh giá và bình luận sản phẩm.
* Gửi email xác nhận đơn hàng.
* Tích hợp chatbot hỗ trợ khách hàng.
* Triển khai Docker và Cloud.

---

# 👨‍💻 Tác giả

**Lưu Nguyên Trường**

* GitHub: https://github.com/truongln04

---

# 📄 License

Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và xây dựng hệ thống thương mại điện tử.
