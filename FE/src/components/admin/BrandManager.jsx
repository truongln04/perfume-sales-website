// export default function BrandManager({
//   brands,
//   search,
//   onSearch,
//   onAdd,
//   onEdit,
//   onDelete,
//   showModal,
//   setShowModal,
//   form,
//   onChange,
//   onSave,
//   editing
// }) {
//   return (
//     <div className="card shadow-sm">
//       <div className="card-header bg-light d-flex justify-content-between align-items-center">
//        <h5 className="m-0 text-primary fw-bold">Quản lý thương hiệu</h5>
//         <div className="d-flex gap-2">
//           <button className="btn btn-primary d-flex align-items-center gap-1" onClick={onAdd}>
//             <i className="bi bi-plus-circle"></i> Thêm mới
//           </button>
//           <div className="input-group" style={{ width: 260 }}>
//             <span className="input-group-text bg-white">
//               <i className="bi bi-search"></i>
//             </span>
//             <input
//               className="form-control"
//               placeholder="Tìm kiếm..."
//               value={search}
//               onChange={e => onSearch(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="card-body p-0">
//         <table className="table table-striped table-hover m-0 align-middle">
//           <thead className="table-primary">
//             <tr>
//               <th style={{ width: 60 }}>ID</th>
//               <th>Tên thương hiệu</th>
//               <th>Quốc gia</th>
//               <th>Logo</th>
//               <th style={{ width: 160 }}>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {brands.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center py-4 text-muted">
//                   <i className="bi bi-info-circle"></i> Không có dữ liệu
//                 </td>
//               </tr>
//             ) : (
//               brands.map(b => (
//                 <tr key={b.id}>
//                   <td>{b.id}</td>
//                   <td>{b.name}</td>
//                   <td>{b.country}</td>
//                   <td className="text-center">
//                     {b.logo ? (
//                       <img src={b.logo} alt={b.name} width={60} height={40} style={{ objectFit: "contain" }} />
//                     ) : (
//                       <span className="text-muted">Không có</span>
//                     )}
//                   </td>
//                   <td className="d-flex gap-2">
//                     <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => onEdit(b)}>
//                       <i className="bi bi-pencil"></i> Sửa
//                     </button>
//                     <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => onDelete(b.id)}>
//                       <i className="bi bi-trash"></i> Xóa
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content shadow-lg">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">{editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h5>
//                 <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label className="form-label fw-bold">Tên thương hiệu</label>
//                   <input className="form-control" name="name" value={form.name} onChange={onChange} />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label fw-bold">Quốc gia</label>
//                   <input className="form-control" name="country" value={form.country} onChange={onChange} />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label fw-bold">Logo (URL)</label>
//                   <input className="form-control" name="logo" value={form.logo} onChange={onChange} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
//                 <button className="btn btn-success" onClick={onSave}>
//                   <i className="bi bi-check-circle"></i> Lưu
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
