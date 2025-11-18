import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  return (
    <div className="container py-4">
      <h2 className="fw-bold">Chi tiết sản phẩm #{id}</h2>
      {/* TODO: gọi API /api/products/:id */}
    </div>
  );
}
