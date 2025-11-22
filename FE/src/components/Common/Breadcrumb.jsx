// src/components/Common/Breadcrumb.jsx
import { Link } from "react-router-dom";

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb m-0 p-0 bg-transparent">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={index}
              className={`breadcrumb-item ${isLast ? "active text-dark fw-semibold" : ""}`}
              aria-current={isLast ? "page" : undefined}
              style={{ fontSize: "0.95rem" }}
            >
              {isLast ? (
                item.label
              ) : (
                <Link
                  to={item.to}
                  className="text-muted text-decoration-none hover-text-dark"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
