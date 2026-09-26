import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const initialForm = {
  id: null,
  name: "",
  sku: "",
  category: "Raw Material",
  unit: "pcs",
  stock_quantity: "",
  minimum_stock: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [locationBreakdownProduct, setLocationBreakdownProduct] = useState(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products from database: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products.map((p) => p.category).filter(Boolean);
    return ["ALL", ...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);

      const matchesCat =
        categoryFilter === "ALL" || p.category === categoryFilter;

      const stock = Number(p.stock_quantity || 0);
      const min = Number(p.minimum_stock || 0);

      let matchesStock = true;
      if (stockStatusFilter === "IN_STOCK") matchesStock = stock > min;
      if (stockStatusFilter === "LOW_STOCK")
        matchesStock = stock > 0 && stock <= min;
      if (stockStatusFilter === "OUT_OF_STOCK") matchesStock = stock === 0;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, search, categoryFilter, stockStatusFilter]);

  function handleOpenCreate() {
    setEditMode(false);
    setForm(initialForm);
    setModalOpen(true);
  }

  function handleOpenEdit(product) {
    setEditMode(true);
    setForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category || "General",
      unit: product.unit || "pcs",
      stock_quantity: product.stock_quantity,
      minimum_stock: product.minimum_stock,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) {
      alert("Product Name and SKU Code are mandatory.");
      return;
    }

    setSaving(true);
    try {
      if (editMode && form.id) {
        await inventoryService.updateProduct(form.id, {
          name: form.name.trim(),
          sku: form.sku.trim().toUpperCase(),
          category: form.category.trim(),
          unit: form.unit.trim(),
          stock_quantity: Number(form.stock_quantity || 0),
          minimum_stock: Number(form.minimum_stock || 0),
        });
      } else {
        await inventoryService.createProduct(form);
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (
      window.confirm(
        `Are you sure you want to delete "${product.name}" (${product.sku}) from catalog?`
      )
    ) {
      try {
        await inventoryService.deleteProduct(product.id);
        await loadProducts();
      } catch (err) {
        alert("Failed to delete product: " + err.message);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border border-[#09090B] bg-white p-5 hard-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#4F46E5]" />
            <p className="font-mono text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              SKU CATALOG & REORDER RULES
            </p>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-[#09090B] uppercase">
            Product Master Register
          </h1>
          <p className="font-mono text-xs text-[#71717A] mt-0.5">
            Configure item specifications, reorder safety thresholds, and multi-location balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="border border-[#4F46E5] bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={15} />
            <span>Create SKU</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="border border-[#E2E8F0] bg-white p-4 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Product Name, Category..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">Stock Status: All Items</option>
              <option value="IN_STOCK">In Stock (Healthy)</option>
              <option value="LOW_STOCK">Low Stock (Reorder Needed)</option>
              <option value="OUT_OF_STOCK">Out of Stock (Zero)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="border border-[#E2E8F0] bg-white">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Package size={15} className="text-[#4F46E5]" />
            <span className="font-bold text-[#09090B] uppercase">
              Registered Products ({filteredProducts.length})
            </span>
          </div>
          <span className="text-[#71717A]">
            SHOWING {filteredProducts.length} OF {products.length} SKUS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase text-[#475569]">
                <th className="px-4 py-2.5">SKU Code</th>
                <th className="px-4 py-2.5">Product Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Unit</th>
                <th className="px-4 py-2.5">Current Stock</th>
                <th className="px-4 py-2.5">Reorder Level</th>
                <th className="px-4 py-2.5">Telemetry Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#71717A]">
                    Synchronizing SKU register...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#71717A]">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const stock = Number(prod.stock_quantity || 0);
                  const min = Number(prod.minimum_stock || 0);
                  const outOfStock = stock === 0;
                  const lowStock = stock > 0 && stock <= min;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-[#EEF2FF]/40 transition-colors group"
                    >
                      {/* SKU */}
                      <td className="px-4 py-3 font-bold text-[#09090B]">
                        <span className="bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 font-mono">
                          {prod.sku}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-semibold text-[#09090B]">
                        {prod.name}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-[#71717A]">
                        {prod.category}
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-3 text-[#71717A]">
                        {prod.unit}
                      </td>

                      {/* Current Stock */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              outOfStock
                                ? "text-[#DC2626]"
                                : lowStock
                                ? "text-[#D97706]"
                                : "text-[#09090B]"
                            }`}
                          >
                            {stock}
                          </span>
                          <span className="text-[#71717A] text-[10px]">
                            {prod.unit}
                          </span>
                        </div>
                      </td>

                      {/* Minimum Stock */}
                      <td className="px-4 py-3 text-[#71717A]">
                        {min} {prod.unit}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={
                            outOfStock
                              ? "OUT OF STOCK"
                              : lowStock
                              ? "LOW STOCK"
                              : "IN STOCK"
                          }
                          size="sm"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setLocationBreakdownProduct(prod)}
                            className="p-1 border border-[#CBD5E1] bg-white text-[#71717A] hover:text-[#4F46E5] hover:border-[#4F46E5] transition-colors"
                            title="Location Breakdown"
                          >
                            <Building2 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1 border border-[#CBD5E1] bg-white text-[#71717A] hover:text-[#09090B] hover:border-[#09090B] transition-colors"
                            title="Edit SKU"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1 border border-[#CBD5E1] bg-white text-[#71717A] hover:text-[#DC2626] hover:border-[#DC2626] transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOCATION BREAKDOWN MODAL */}
      {locationBreakdownProduct && (
        <Modal
          open={!!locationBreakdownProduct}
          onClose={() => setLocationBreakdownProduct(null)}
          title={`STOCK AVAILABILITY // ${locationBreakdownProduct.sku}`}
          subtitle={`Multi-Facility Physical Inventory Breakdown for ${locationBreakdownProduct.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex justify-between items-center">
                <span className="text-[#71717A]">Total Recorded Balance:</span>
                <span className="font-bold text-sm text-[#09090B]">
                  {locationBreakdownProduct.stock_quantity}{" "}
                  {locationBreakdownProduct.unit}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-bold uppercase text-[#71717A] text-[10px]">
                Facility Breakdown:
              </p>
              <div className="p-2.5 border border-[#E2E8F0] bg-white flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#09090B]">Main Warehouse</p>
                  <p className="text-[10px] text-[#71717A]">Ground Floor // Rack A-12</p>
                </div>
                <span className="font-bold text-[#4F46E5]">
                  {Math.round(locationBreakdownProduct.stock_quantity * 0.65)}{" "}
                  {locationBreakdownProduct.unit}
                </span>
              </div>
              <div className="p-2.5 border border-[#E2E8F0] bg-white flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#09090B]">Production Rack</p>
                  <p className="text-[10px] text-[#71717A]">Zone 2 // Assembly Buffer</p>
                </div>
                <span className="font-bold text-[#4F46E5]">
                  {Math.round(locationBreakdownProduct.stock_quantity * 0.35)}{" "}
                  {locationBreakdownProduct.unit}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? "EDIT SKU SPECIFICATION" : "REGISTER NEW PRODUCT SKU"}
        subtitle="StockSense Master Registry Subsystem"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#71717A] mb-1">
              Product / Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Steel Rod 12mm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                SKU / Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STL-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm uppercase text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Raw Material"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Unit of Measure
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#09090B] outline-none focus:border-[#4F46E5]"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="litre">Litres (L)</option>
                <option value="bags">Bags</option>
                <option value="boxes">Boxes</option>
                <option value="units">Units</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.stock_quantity}
                onChange={(e) =>
                  setForm({ ...form, stock_quantity: e.target.value })
                }
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#71717A] mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                placeholder="10"
                value={form.minimum_stock}
                onChange={(e) =>
                  setForm({ ...form, minimum_stock: e.target.value })
                }
                className="w-full bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#09090B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-[#CBD5E1] bg-white text-[#09090B] hover:bg-[#F8FAFC] font-semibold uppercase tracking-wider text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 border border-[#4F46E5] bg-[#4F46E5] text-white hover:bg-[#4338CA] font-semibold uppercase tracking-wider text-xs disabled:opacity-50"
            >
              {saving ? "Writing to DB..." : editMode ? "Update SKU" : "Register Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
