import { useState, useMemo } from "react";

export default function Warehouse() {
  const [items] = useState([
    {
      id: "SP001",
      name: "Nước hoa A",
      imported: 150,
      sold: 30,
    },
    {
      id: "SP002",
      name: "Nước hoa B",
      imported: 100,
      sold: 20,
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = !q
      ? items
      : items.filter(
          i => i.id.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
        );
    return [...result].sort((a, b) => a.id.localeCompare(b.id));
  }, [items, search]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0">Quản lý Kho</h5>
        <input
          className="form-control"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Không tìm thấy sản phẩm</td>
              </tr>
            ) : (
              filteredItems.map(i => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>{i.name}</td>
                  <td>{i.imported}</td>
                  <td>{i.sold}</td>
                  <td>{i.imported - i.sold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
