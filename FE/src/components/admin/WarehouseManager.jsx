import { useState, useMemo } from "react";
import Pagination from "../Common/Pagination"; // import component phân trang

export default function WarehouseManager({ items }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // số sản phẩm mỗi trang

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = !q
      ? items
      : items.filter(
          i =>
            i.tenSanPham.toLowerCase().includes(q) ||
            i.idSanPham.toString().includes(q)
        );
    return [...result].sort((a, b) => a.idSanPham - b.idSanPham);
  }, [items, search]);

  // Tổng số trang
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  // Cắt dữ liệu theo trang
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0 text-primary fw-bold">Quản lý tồn kho</h5>
        <input
          className="form-control"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset về trang 1 khi tìm kiếm
          }}
          style={{ width: 260 }}
        />
      </div>
      <div className="card-body p-0">
        <table className="table table-hover table-striped m-0">
          <thead className="table-light">
            <tr>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Đã nhập</th>
              <th>Đã bán</th>
              <th>Tồn hiện tại</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Không tìm thấy sản phẩm
                </td>
              </tr>
            ) : (
              paginatedItems.map(i => (
                <tr key={i.idSanPham}>
                  <td>{i.idSanPham}</td>
                  <td>{i.tenSanPham}</td>
                  <td>{i.soLuongNhap}</td>
                  <td>{i.soLuongBan}</td>
                  <td>{i.soLuongNhap - i.soLuongBan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Thêm phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        variant="admin" // hoặc "client" tùy giao diện
      />
    </div>
  );
}
