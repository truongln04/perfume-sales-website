import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Lấy giỏ hàng từ API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:8081/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json();

        const cartRes = await fetch(`http://localhost:8081/cart/${user.idTaiKhoan}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await cartRes.json();
        setCartItems(data);
      } catch (err) {
        console.error("Lỗi khi lấy giỏ hàng:", err);
      }
    };
    fetchCart();
  }, [token]);

  // Chọn tất cả
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.idGh));
    }
    setSelectAll(!selectAll);
  };

  // Chọn từng sản phẩm
  const handleSelectItem = (idGh) => {
    if (selectedItems.includes(idGh)) {
      setSelectedItems(selectedItems.filter((id) => id !== idGh));
    } else {
      setSelectedItems([...selectedItems, idGh]);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (idGh, newQuantity) => {
    try {
      const res = await fetch(`http://localhost:8081/cart/${idGh}?soLuong=${newQuantity}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setCartItems(
          cartItems.map((item) =>
            item.idGh === idGh ? { ...item, soLuong: updated.soLuong } : item
          )
        );
      } else {
        alert("Cập nhật số lượng thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
      alert("Có lỗi xảy ra khi cập nhật số lượng!");
    }
  };

  // Tính tổng tiền theo sản phẩm đã chọn
  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.idGh))
    .reduce((sum, item) => sum + item.donGia * item.soLuong, 0);

  // Xóa sản phẩm
  const removeItem = async (idGh) => {
    try {
      const res = await fetch(`http://localhost:8081/cart/${idGh}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCartItems(cartItems.filter((item) => item.idGh !== idGh));
        setSelectedItems(selectedItems.filter((id) => id !== idGh));
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: cartItems.length - 1 }));
        alert("Xóa sản phẩm thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert("Có lỗi xảy ra khi xóa sản phẩm!");
    }
  };

  // Đặt hàng
  const handleOrder = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    const itemsToCheckout = cartItems
      .filter((item) => selectedItems.includes(item.idGh))
      .map((item) => ({
        idGh: item.idGh,
        idSanPham: item.idSanPham,
        tenSanPham: item.tenSanPham,
        donGia: item.donGia,
        soLuong: item.soLuong,
        hinhAnh: item.hinhAnh,
      }));

    navigate("../checkout", {
      replace: false,
      state: {
        selectedItems: itemsToCheckout,
        totalPrice: totalPrice,
      },
    });
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Giỏ hàng</h3>
      {cartItems.length === 0 ? (
        <p className="text-muted">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      aria-label="Chọn tất cả sản phẩm"
                    />
                  </th>
                  <th>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-center">Số lượng</th>
                  <th className="text-end">Thành tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.idGh}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.idGh)}
                        onChange={() => handleSelectItem(item.idGh)}
                        aria-label={`Chọn sản phẩm ${item.tenSanPham}`}
                      />
                    </td>
                    <td>
                      <img
                        src={item.hinhAnh || "/placeholder.jpg"}
                        alt={`Ảnh sản phẩm ${item.tenSanPham}`}
                        title={item.tenSanPham}
                        className="rounded"
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                      />
                    </td>
                    <td>{item.tenSanPham}</td>
                    <td className="text-end">{item.donGia.toLocaleString()} ₫</td>

                    {/* Cột số lượng căn giữa */}
                    <td className="text-center" style={{ minWidth: 100 }}>
                      <input
                        type="number"
                        min="1"
                        value={item.soLuong}
                        onChange={(e) =>
                          updateQuantity(item.idGh, parseInt(e.target.value))
                        }
                        className="form-control form-control-sm text-center mx-auto"
                        style={{ width: 70 }}
                        aria-label={`Số lượng của ${item.tenSanPham}`}
                      />
                    </td>

                    <td className="text-end">
                      {(item.donGia * item.soLuong).toLocaleString()} ₫
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeItem(item.idGh)}
                        aria-label={`Xóa ${item.tenSanPham}`}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4 className="mb-0">
              Tổng tiền:{" "}
              <span className="text-danger fw-bold">
                {totalPrice.toLocaleString()} ₫
              </span>
            </h4>
            <button
              className="btn btn-primary btn-sm px-3 rounded-pill"
              disabled={selectedItems.length === 0}
              onClick={handleOrder}
              aria-label="Tiến hành đặt hàng"
            >
              Đặt hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
}
