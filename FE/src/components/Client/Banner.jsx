export default function Banner() {
  return (
    <div className="position-relative">
      <img
        src="https://orchard.vn/wp-content/uploads/2025/10/Orchard-20-10-huong-len-ngoi-nang-len-huong-cover.webp"
        className="w-100"
        alt="Hương lên ngôi, Nàng lên hương"
        style={{ height: "680px", objectFit: "cover" }}
      />

      <div className="position-absolute top-50 start-0 translate-middle-y ps-5 ps-xl-8">
        <h1
          className="display-1 fw-bold text-white lh-1"
          style={{
            fontSize: "4.5rem",
            textShadow: "3px 3px 15px rgba(0,0,0,0.8)",
            letterSpacing: "2px",
          }}
        >
          Hương lên ngôi
          <br />
          Nàng lên hương
        </h1>

        <a
          href="/products"
          className="btn btn-danger btn-lg mt-4 px-5 py-3 rounded-pill fw-semibold shadow-lg"
          style={{ fontSize: "1.1rem" }}
        >
          MUA NGAY
        </a>
      </div>
    </div>
  );
}
