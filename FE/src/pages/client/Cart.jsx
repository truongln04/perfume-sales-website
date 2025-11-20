import { useState, useEffect } from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.giaBan * item.quantity,
    0
  );

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Giỏ hàng</h2>
      {cartItems.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tạm tính</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.tenSanPham}</td>
                  <td>{item.giaBan.toLocaleString()} ₫</td>
                  <td>{item.quantity}</td>
                  <td>{(item.giaBan * item.quantity).toLocaleString()} ₫</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>Tổng cộng: {totalPrice.toLocaleString()} ₫</h4>
            <button className="btn btn-primary btn-lg">Thanh toán</button>
          </div>
        </>
      )}
    </div>
  );
}
