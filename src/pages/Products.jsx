import { useEffect, useMemo, useState } from "react";
import { Package, Plus, Search, X } from "lucide-react";

import { supabase } from "../lib/supabase";
import Modal from "../components/Modal";

const initialForm = {
  name: "",
  sku: "",
  category: "General",
  unit: "pcs",
  stock: "",
  minimum: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState(initialForm);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
    }

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products.map((product) => product.category).filter(Boolean);

    return ["ALL", ...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setForm(initialForm);
  }

  async function createProduct(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      alert("SKU is required.");
      return;
    }

    const stock = Number(form.stock || 0);
    const minimum = Number(form.minimum || 0);

    if (stock < 0 || minimum < 0) {
      alert("Stock values cannot be negative.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category.trim() || "General",
      unit: form.unit.trim() || "pcs",
      stock_quantity: stock,
      minimum_stock: minimum,
    });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        alert("This SKU already exists.");
      } else {
        alert(error.message);
      }

      setSaving(false);
      return;
    }

    setSaving(false);

    closeModal();
    await loadProducts();
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadProducts();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">PRODUCT CATALOG</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">Products</h1>

          <p className="mt-1 text-slate-500">
            Manage products, stock levels and reordering thresholds.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU or category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "ALL" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">Product</th>

                <th className="px-6 py-4">SKU</th>

                <th className="px-6 py-4">Category</th>

                <th className="px-6 py-4">Stock</th>

                <th className="px-6 py-4">Reorder Level</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Package size={32} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-medium text-slate-600">
                      No products found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or add a product.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = Number(product.stock_quantity || 0);

                  const minimum = Number(product.minimum_stock || 0);

                  const outOfStock = stock === 0;
                  const lowStock = stock > 0 && stock <= minimum;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {product.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              Unit: {product.unit}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium">
                          {product.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-slate-600">
                        {product.category}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {stock}
                        </span>

                        <span className="ml-1 text-slate-500">
                          {product.unit}
                        </span>
                      </td>

                      {/* Minimum */}
                      <td className="px-6 py-4 text-slate-600">
                        {minimum} {product.unit}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {outOfStock ? (
                          <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                            OUT OF STOCK
                          </span>
                        ) : lowStock ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                            IN STOCK
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteProduct(product)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete product"
                        >
                          <X size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredProducts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {products.length}
          </span>{" "}
          products
        </div>
      </div>

      {/* Create Product Modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Create Product">
        <form onSubmit={createProduct} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Product Name *
            </label>

            <input
              required
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Steel Rod"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              SKU / Code *
            </label>

            <input
              required
              value={form.sku}
              onChange={(event) => updateForm("sku", event.target.value)}
              placeholder="STL-001"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-blue-500"
            />
          </div>

          {/* Category + Unit */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Category
              </label>

              <input
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                placeholder="Raw Material"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Unit of Measure
              </label>

              <select
                value={form.unit}
                onChange={(event) => updateForm("unit", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="litre">Litres</option>
                <option value="ml">Millilitres</option>
                <option value="bags">Bags</option>
                <option value="boxes">Boxes</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Initial Stock
              </label>

              <input
                min="0"
                type="number"
                value={form.stock}
                onChange={(event) => updateForm("stock", event.target.value)}
                placeholder="100"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Reorder Level
              </label>

              <input
                min="0"
                type="number"
                value={form.minimum}
                onChange={(event) => updateForm("minimum", event.target.value)}
                placeholder="20"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />

            {saving ? "Creating..." : "Create Product"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
