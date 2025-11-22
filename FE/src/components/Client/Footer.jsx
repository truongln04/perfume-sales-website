export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-4 pb-3 mt-5">
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Về chúng tôi */}
          <div className="col-md-3 mb-4">
            <h5 className="fw-bold mb-2">VỀ CHÚNG TÔI</h5>
            <p className="company-info small">
              Ra đời ngày 14/8/2004, Orchard.vn là website nước hoa đầu tiên tại Việt Nam,
              cung cấp hơn 200 nhãn hiệu cao cấp. Định hướng trở thành nhà cung cấp nước hoa số 1 tại VN,
              mang lại sự đa dạng, tiện lợi và hài lòng cho khách hàng.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-2">LIÊN KẾT NHANH</h6>
            <ul className="list-unstyled small">
              <li><a href="/client" className="text-light text-decoration-none">Trang chủ</a></li>
              <li><a href="/client/products" className="text-light text-decoration-none">Sản phẩm</a></li>
              <li><a href="/client/orderslist" className="text-light text-decoration-none">Đơn hàng</a></li>
              <li><a href="/client/profile" className="text-light text-decoration-none">Tài khoản</a></li>
            </ul>
          </div>

          {/* Nước hoa */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-2">NƯỚC HOA</h6>
            <ul className="list-unstyled small mb-3">
              <li><a href="/nuoc-hoa-nam" className="text-light text-decoration-none">Nước hoa Nam</a></li>
              <li><a href="/nuoc-hoa-nu" className="text-light text-decoration-none">Nước hoa Nữ</a></li>
              <li><a href="/nuoc-hoa-niche" className="text-light text-decoration-none">Nước hoa Niche</a></li>
              <li><a href="/nuoc-hoa-mini" className="text-light text-decoration-none">Nước hoa Mini</a></li>
            </ul>
          </div>

          {/* Kết nối */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-2">KẾT NỐI CÙNG ORCHARD</h6>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <a href="https://facebook.com" className="text-light fs-5"><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com" className="text-light fs-5"><i className="bi bi-instagram"></i></a>
              <a href="https://youtube.com" className="text-light fs-5"><i className="bi bi-youtube"></i></a>
              <a href="https://zalo.me" className="text-light fs-5"><i className="bi bi-chat-dots"></i></a>
            </div>
          </div>
        </div>

        {/* Dòng cuối */}
        <div className="border-top border-secondary mt-3 pt-2 text-center">
          <p className="">
            © 2025 Orchard.vn. Bản quyền nội dung thuộc về Orchard. Trích dẫn "orchard.vn" khi sử dụng thông tin từ website này.
          </p>
        </div>
      </div>
    </footer>
  );
}
