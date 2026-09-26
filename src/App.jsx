import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Products from "./pages/Products";

function Placeholder({ title }) {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

      <p className="mt-2 text-slate-500">
        This module is being built by another team member.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Placeholder title="Dashboard" />} />

          <Route path="/products" element={<Products />} />

          <Route path="/receipts" element={<Placeholder title="Receipts" />} />

          <Route
            path="/deliveries"
            element={<Placeholder title="Deliveries" />}
          />

          <Route
            path="/transfers"
            element={<Placeholder title="Transfers" />}
          />

          <Route
            path="/adjustments"
            element={<Placeholder title="Adjustments" />}
          />

          <Route
            path="/ledger"
            element={<Placeholder title="Stock Ledger" />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
