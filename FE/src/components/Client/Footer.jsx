export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-4 pb-2 mt-5">
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Logo & giới thiệu */}
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-2">Perfume Store</h5>
            <p className="text-muted small mb-0">
              Mang đến cho bạn những mùi hương tinh tế, sang trọng và quyến rũ.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold mb-2">Liên kết nhanh</h6>
            <ul className="list-unstyled small">
              <li>
                <a href="/client" className="text-light text-decoration-none">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/client/products" className="text-light text-decoration-none">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="/client/cart" className="text-light text-decoration-none">
                  Giỏ hàng
                </a>
              </li>
              <li>
                <a href="/client/profile" className="text-light text-decoration-none">
                  Tài khoản
                </a>
              </li>
            </ul>
          </div>

          {/* Mạng xã hội */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold mb-2">Kết nối với chúng tôi</h6>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <a href="https://facebook.com" className="text-light fs-5">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://instagram.com" className="text-light fs-5">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://twitter.com" className="text-light fs-5">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="mailto:info@perfumestore.com" className="text-light fs-5">
                <i className="bi bi-envelope"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Dòng cuối */}
        <div className="border-top border-secondary mt-3 pt-2 text-center">
          <p className="mb-0 text-muted small">
            © 2025 Perfume Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
