// src/components/Common/Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange, variant = "client" }) {
  if (totalPages <= 1) return null;

  const isClient = variant === "client";

  return (
    <div
      className={`mt-4 d-flex justify-content-center gap-2 flex-wrap ${
        isClient ? "" : "justify-content-start"
      }`}
    >
      {/* Nút Trước */}
      <button
        className={`btn btn-sm ${isClient ? "rounded-pill" : ""} ${
          currentPage === 1 ? "btn-secondary disabled" : "btn-outline-primary"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {isClient ? "‹ Trước" : "←"}
      </button>

      {/* Số trang */}
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          className={`btn btn-sm ${isClient ? "rounded-pill px-3" : "px-2"} ${
            currentPage === i + 1 ? "btn-dark" : "btn-outline-secondary"
          }`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      {/* Nút Sau */}
      <button
        className={`btn btn-sm ${isClient ? "rounded-pill" : ""} ${
          currentPage === totalPages ? "btn-secondary disabled" : "btn-outline-primary"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {isClient ? "Sau ›" : "→"}
      </button>

      {/* Admin hiển thị thêm tổng số */}
      {!isClient && (
        <span className="ms-3 text-muted small">
          Trang {currentPage}/{totalPages}
        </span>
      )}
    </div>
  );
}
