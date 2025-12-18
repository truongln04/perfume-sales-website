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
        setCartItems(data.chiTietGioHang || []);

        // ✅ phát sự kiện với số sản phẩm (length)
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: (data.chiTietGioHang || []).length }));
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
      setSelectedItems(cartItems.map((item) => item.idCtgh));
    }
    setSelectAll(!selectAll);
  };

  // Chọn từng sản phẩm
  const handleSelectItem = (idCtgh) => {
    if (selectedItems.includes(idCtgh)) {
      setSelectedItems(selectedItems.filter((id) => id !== idCtgh));
    } else {
      setSelectedItems([...selectedItems, idCtgh]);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (idCtgh, newQuantity) => {
    try {
      const item = cartItems.find(i => i.idCtgh === idCtgh);
      if (!item) return;

      // gọi API sản phẩm để lấy tồn kho
      const resSp = await fetch(`http://localhost:8081/products/${item.idSanPham}`);
      const sp = await resSp.json();

      if (newQuantity > sp.soLuongTon) {
        alert(`Số lượng vượt quá tồn kho (${sp.soLuongTon}).`);
        return;
      }
      if (newQuantity < 1) {
        alert("Số lượng phải lớn hơn 0.");
        return;
      }

      const res = await fetch(
        `http://localhost:8081/cart/${idCtgh}?soLuong=${newQuantity}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const updatedCart = await res.json();
        setCartItems(updatedCart.chiTietGioHang);

        window.dispatchEvent(
          new CustomEvent("cart-updated", {
            detail: updatedCart.chiTietGioHang.length,
          })
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
    .filter((item) => selectedItems.includes(item.idCtgh))
    .reduce((sum, item) => sum + item.donGia * item.soLuong, 0);

  const removeItem = async (idCtgh) => {
    try {
      const res = await fetch(`http://localhost:8081/cart/${idCtgh}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // cập nhật lại state giỏ hàng
        setCartItems(cartItems.filter((item) => item.idCtgh !== idCtgh));
        setSelectedItems(selectedItems.filter((id) => id !== idCtgh));
        setSelectAll(false);

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
      .filter((item) => selectedItems.includes(item.idCtgh))
      .map((item) => ({
        idCtgh: item.idCtgh,
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

  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert("Không có sản phẩm nào được chọn để xóa!");
      return;
    }
    try {
      for (const idCtgh of selectedItems) {
        await fetch(`http://localhost:8081/cart/${idCtgh}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // reset lại giỏ hàng và lựa chọn
      setCartItems(cartItems.filter((item) => !selectedItems.includes(item.idCtgh)));
      setSelectedItems([]);
      setSelectAll(false);

      window.dispatchEvent(new CustomEvent("cart-updated", { detail: cartItems.length - selectedItems.length }));
      alert("Đã xóa các sản phẩm đã chọn!");
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert("Có lỗi xảy ra khi xóa sản phẩm!");
    }
  };


  const clearCart = async () => {
    try {
      const resMe = await fetch("http://localhost:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await resMe.json();

      console.log("User ID:", user.idTaiKhoan);
      const res = await fetch(
        `http://localhost:8081/cart/clear/${user.idTaiKhoan}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setCartItems([]);       // Xóa toàn bộ trên UI
        setSelectedItems([]);   // Reset lựa chọn
        setSelectAll(false);

        // Cập nhật Navbar
        window.dispatchEvent(
          new CustomEvent("cart-updated", { detail: 0 })
        );

        alert("Đã xóa toàn bộ giỏ hàng!");
      } else {
        alert("Xóa giỏ hàng thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa giỏ hàng:", err);
      alert("Có lỗi xảy ra khi xóa giỏ hàng!");
    }
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
                        checked={selectedItems.includes(item.idCtgh)}
                        onChange={() => handleSelectItem(item.idCtgh)}
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
                          updateQuantity(item.idCtgh, parseInt(e.target.value))
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
                        onClick={() => {
                          if (selectAll) {
                            // nếu chọn tất cả thì xóa toàn bộ
                            removeSelectedItems();
                          } else {
                            // nếu chỉ chọn 1 thì xóa sản phẩm đó
                            removeItem(item.idCtgh);
                          }
                        }}
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

            <div className="d-flex align-items-center" style={{ gap: "12px" }}>
              {/* Nút xoá đã chọn */}
              <button
                className="btn btn-outline-danger btn-sm px-3 fw-bold rounded-pill shadow-sm"
                disabled={selectedItems.length === 0}
                onClick={removeSelectedItems}
                aria-label="Xóa các sản phẩm đã chọn"
              >
                🗑 Xóa đã chọn
              </button>

              {/* Nút đặt hàng */}
              <button
                className="btn btn-primary btn-sm px-3 fw-bold rounded-pill shadow-sm"
                disabled={selectedItems.length === 0}
                onClick={handleOrder}
                aria-label="Tiến hành đặt hàng ngay"
              >
                🛒 Đặt hàng
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
