// app/products/page.tsx
"use client";

import React from "react";
import useProduct from "@/hooks/useProduct";
import ProductDetailModal from "@/components/ProductDetailModal";

export default function ProductPage() {
  const productHook = useProduct();
  const {
    products,
    loading,
    search,
    page,
    total,
    setSearch,
    setPage,
    isProductModalOpen,
    currentProduct,
    setCurrentProduct,
    openProductModal,
    closeProductModal,
    saveProduct,
    deleteProduct,
    openDetailModal,
  } = productHook;

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Action Bar */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/60 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Quản Lý Sản Phẩm
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý danh sách, cấu hình giá, hình ảnh và thuộc tính sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => openProductModal(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm mới
            </button>
          </div>
        </div>

        {/* Product Table Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Giá bán</th>
                  <th className="px-6 py-4">Giảm giá</th>
                  <th className="px-6 py-4">Đã bán</th>
                  <th className="px-6 py-4">Đánh giá</th>
                  <th className="px-6 py-4 text-center">Thuộc tính</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-400"
                    >
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>
                      <p className="mt-2 text-xs">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-400"
                    >
                      Không tìm thấy sản phẩm phù hợp.
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr
                      key={item.productId}
                      className="hover:bg-slate-50/60 transition"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-400">
                        #{item.productId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {item.price.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          đ
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.salePercent > 0 ? (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 border border-rose-100">
                            -{item.salePercent}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.sold}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/50">
                          ⭐ {item.review}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openDetailModal(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Size / Color / Ảnh
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-3">
                          <button
                            onClick={() => openProductModal(item)}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            Sửa
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => deleteProduct(item.productId)}
                            className="font-semibold text-rose-500 hover:text-rose-700 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500">
              Hiển thị tổng cộng{" "}
              <strong className="text-slate-800">{total}</strong> sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Trang trước
              </button>
              <span className="px-2 text-xs font-bold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Trang sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THÊM / SỬA SẢN PHẨM CHÍNH */}
      {isProductModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              {currentProduct.productId
                ? "Cập Nhật Sản Phẩm"
                : "Thêm Sản Phẩm Mới"}
            </h2>
            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={currentProduct.name}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    value={currentProduct.price}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    value={currentProduct.salePercent}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        salePercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={currentProduct.description || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP CHI TIẾT SẢN PHẨM */}
      <ProductDetailModal useProductHook={productHook} />
    </div>
  );
}
