import { supabase } from "../lib/supabase.js";

const STORAGE_KEYS = {
  RECEIPTS: "stocksense_receipts_v2",
  DELIVERIES: "stocksense_deliveries_v2",
  TRANSFERS: "stocksense_transfers_v2",
  ADJUSTMENTS: "stocksense_adjustments_v2",
  LEDGER: "stocksense_ledger_v2",
  WAREHOUSES: "stocksense_warehouses_v2",
  LOCATIONS: "stocksense_locations_v2",
  USER_PROFILE: "stocksense_user_profile_v2",
};

// Fallback seed operations matching the Problem Statement example:
// 1. Receive 100 kg Steel (Stock +100)
// 2. Internal Transfer: Main Store -> Production Rack
// 3. Deliver finished goods: 20 chairs/steel (Stock -20)
// 4. Adjust damaged items: 3 kg steel damaged (Stock -3)
const SEED_OPERATIONS = {
  receipts: [
    {
      id: "rec-001",
      receipt_number: "REC-2026-001",
      supplier: "Industrial Alloys Corp.",
      warehouse_id: "main-wh",
      warehouse_name: "Main Warehouse",
      location_name: "Receiving Dock 01",
      status: "Done",
      notes: "Initial supplier bulk shipment for Q1 manufacturing.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      validated_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      items: [
        {
          product_id: "23ed3c68-3f5b-43f0-8824-3003f3ffc44c",
          product_name: "Steel Rod",
          sku: "STL-001",
          expected_qty: 100,
          received_qty: 100,
          unit: "kg",
        },
      ],
    },
    {
      id: "rec-002",
      receipt_number: "REC-2026-002",
      supplier: "Apex Fasteners Ltd.",
      warehouse_id: "main-wh",
      warehouse_name: "Main Warehouse",
      location_name: "Bay 03",
      status: "Ready",
      notes: "Awaiting final batch inspection before shelving.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      items: [
        {
          product_id: "6f77180a-ca74-4d5f-b241-a1a3667c8988",
          product_name: "Bolts",
          sku: "BLT-001",
          expected_qty: 50,
          received_qty: 50,
          unit: "pcs",
        },
      ],
    },
    {
      id: "rec-003",
      receipt_number: "REC-2026-003",
      supplier: "Nordic Woodworks",
      warehouse_id: "secondary-wh",
      warehouse_name: "Secondary Warehouse",
      location_name: "Staging Bay",
      status: "Draft",
      notes: "Scheduled delivery for next morning.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      items: [
        {
          product_id: "9639e866-1361-43e7-a7be-666c8bc5c092",
          product_name: "Table",
          sku: "TBL-001",
          expected_qty: 25,
          received_qty: 0,
          unit: "pcs",
        },
      ],
    },
  ],
  deliveries: [
    {
      id: "del-001",
      delivery_number: "DEL-2026-001",
      customer: "Metropolis Construction Ltd.",
      warehouse_id: "main-wh",
      warehouse_name: "Main Warehouse",
      location_name: "Dispatch Bay A",
      status: "Done",
      notes: "Commercial order fulfillment #SO-8842",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      validated_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
      items: [
        {
          product_id: "522c0eb0-23c9-4e52-9b96-f3c44cbd51d6",
          product_name: "Chair",
          sku: "CHR-001",
          ordered_qty: 10,
          picked_qty: 10,
          unit: "pcs",
        },
      ],
    },
    {
      id: "del-002",
      delivery_number: "DEL-2026-002",
      customer: "Global Workspace Interiors",
      warehouse_id: "main-wh",
      warehouse_name: "Main Warehouse",
      location_name: "Dispatch Bay B",
      status: "Waiting",
      notes: "Picking list generated, awaiting warehouse staff packing.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      items: [
        {
          product_id: "9639e866-1361-43e7-a7be-666c8bc5c092",
          product_name: "Table",
          sku: "TBL-001",
          ordered_qty: 6,
          picked_qty: 0,
          unit: "pcs",
        },
      ],
    },
  ],
  transfers: [
    {
      id: "trf-001",
      transfer_number: "TRF-2026-001",
      product_id: "23ed3c68-3f5b-43f0-8824-3003f3ffc44c",
      product_name: "Steel Rod",
      sku: "STL-001",
      source_warehouse: "Main Warehouse",
      source_location: "Main Store // Rack A",
      dest_warehouse: "Production Rack",
      dest_location: "Production Floor // Bay 1",
      quantity: 30,
      unit: "kg",
      status: "Done",
      notes: "Internal routing to manufacturing line.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(),
    },
    {
      id: "trf-002",
      transfer_number: "TRF-2026-002",
      product_id: "6f77180a-ca74-4d5f-b241-a1a3667c8988",
      product_name: "Bolts",
      sku: "BLT-001",
      source_warehouse: "Main Warehouse",
      source_location: "Rack B",
      dest_warehouse: "Secondary Warehouse",
      dest_location: "Aisle 2 // Shelf 4",
      quantity: 40,
      unit: "pcs",
      status: "Waiting",
      notes: "Inter-facility replenishment transit.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
  adjustments: [
    {
      id: "adj-001",
      adjustment_number: "ADJ-2026-001",
      product_id: "23ed3c68-3f5b-43f0-8824-3003f3ffc44c",
      product_name: "Steel Rod",
      sku: "STL-001",
      warehouse_name: "Production Rack",
      location_name: "Production Floor",
      recorded_qty: 103,
      counted_qty: 100,
      difference_qty: -3,
      reason: "Damaged Goods",
      notes: "3 kg steel rod section damaged during crane unloading.",
      status: "Done",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
  ledger: [
    {
      id: "led-001",
      reference_number: "REC-2026-001",
      document_type: "RECEIPT",
      product_id: "23ed3c68-3f5b-43f0-8824-3003f3ffc44c",
      product_name: "Steel Rod",
      sku: "STL-001",
      from_location: "Industrial Alloys Corp.",
      to_location: "Main Warehouse // Dock 01",
      quantity_delta: 100,
      stock_after: 100,
      unit: "kg",
      operator: "Inventory Manager",
      notes: "Vendor delivery validated & received.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    },
    {
      id: "led-002",
      reference_number: "DEL-2026-001",
      document_type: "DELIVERY",
      product_id: "522c0eb0-23c9-4e52-9b96-f3c44cbd51d6",
      product_name: "Chair",
      sku: "CHR-001",
      from_location: "Main Warehouse // Bay A",
      to_location: "Metropolis Construction Ltd.",
      quantity_delta: -10,
      stock_after: 45,
      unit: "pcs",
      operator: "Warehouse Staff",
      notes: "Customer dispatch completed.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    },
    {
      id: "led-003",
      reference_number: "TRF-2026-001",
      document_type: "TRANSFER",
      product_id: "23ed3c68-3f5b-43f0-8824-3003f3ffc44c",
      product_name: "Steel Rod",
      sku: "STL-001",
      from_location: "Main Warehouse // Main Store",
      to_location: "Production Rack // Bay 1",
      quantity_delta: 0,
      movement_quantity: 30,
      stock_after: 100,
      unit: "kg",
      operator: "Warehouse Staff",
      notes: "Relocated 30 kg to Production Floor.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(),
    },
    {
      id: "led-004",
      reference_number: "ADJ-2026-001",
      document_type: "ADJUSTMENT",
      product_id: "23ed3c68-3f5b-43f0-8824-3003f3ffc44c",
      product_name: "Steel Rod",
      sku: "STL-001",
      from_location: "Production Floor",
      to_location: "Scrap / Damaged Bin",
      quantity_delta: -3,
      stock_after: 100,
      unit: "kg",
      operator: "Inventory Manager",
      notes: "Count correction: 3 kg damaged rod written off.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};

function getLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (fallback !== undefined) {
        localStorage.setItem(key, JSON.stringify(fallback));
      }
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Local storage read error for ${key}:`, err);
    return fallback;
  }
}

function setLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Local storage write error for ${key}:`, err);
  }
}

export const inventoryService = {
  // Initialize storage with seeds
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.RECEIPTS)) {
      setLocal(STORAGE_KEYS.RECEIPTS, SEED_OPERATIONS.receipts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DELIVERIES)) {
      setLocal(STORAGE_KEYS.DELIVERIES, SEED_OPERATIONS.deliveries);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSFERS)) {
      setLocal(STORAGE_KEYS.TRANSFERS, SEED_OPERATIONS.transfers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS)) {
      setLocal(STORAGE_KEYS.ADJUSTMENTS, SEED_OPERATIONS.adjustments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEDGER)) {
      setLocal(STORAGE_KEYS.LEDGER, SEED_OPERATIONS.ledger);
    }
  },

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to fetch products from Supabase:", err);
      // Fallback
      return [];
    }
  },

  async createProduct(productData) {
    const payload = {
      name: productData.name.trim(),
      sku: productData.sku.trim().toUpperCase(),
      category: productData.category?.trim() || "General",
      unit: productData.unit?.trim() || "pcs",
      stock_quantity: Number(productData.stock || productData.stock_quantity || 0),
      minimum_stock: Number(productData.minimum || productData.minimum_stock || 0),
    };

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Log initial stock in ledger if > 0
    if (payload.stock_quantity > 0) {
      await this.addLedgerEntry({
        reference_number: `INIT-${payload.sku}`,
        document_type: "INITIAL",
        product_id: data.id,
        product_name: data.name,
        sku: data.sku,
        from_location: "Opening Balance",
        to_location: "Main Warehouse",
        quantity_delta: payload.stock_quantity,
        stock_after: payload.stock_quantity,
        unit: data.unit,
        operator: "Inventory Manager",
        notes: "Initial inventory setup.",
      });
    }

    return data;
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  // Direct stock adjustment in Supabase
  async adjustProductStockInDb(productId, deltaQuantity) {
    // 1. Get current stock
    const { data: prod, error: fetchErr } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single();

    if (fetchErr) throw fetchErr;

    const currentStock = Number(prod.stock_quantity || 0);
    const newStock = Math.max(0, currentStock + Number(deltaQuantity));

    const { data: updated, error: updateErr } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return { oldStock: currentStock, newStock, product: updated };
  },

  // ----------------------------------------------------
  // WAREHOUSES & LOCATIONS
  // ----------------------------------------------------
  async getWarehouses() {
    try {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        // Deduplicate warehouse names if needed
        const seen = new Set();
        return data.filter((w) => {
          if (seen.has(w.name)) return false;
          seen.add(w.name);
          return true;
        });
      }
    } catch (err) {
      console.warn("Warehouses fetch fallback:", err);
    }

    return [
      { id: "wh-1", name: "Main Warehouse", location: "Ground Floor // Logistics Hub" },
      { id: "wh-2", name: "Production Rack", location: "Factory Floor // Zone A" },
      { id: "wh-3", name: "Secondary Warehouse", location: "Distribution Center // Block B" },
    ];
  },

  // ----------------------------------------------------
  // RECEIPTS (INCOMING GOODS)
  // ----------------------------------------------------
  getReceipts() {
    return getLocal(STORAGE_KEYS.RECEIPTS, SEED_OPERATIONS.receipts);
  },

  async createReceipt(receipt) {
    const receipts = this.getReceipts();
    const count = receipts.length + 1;
    const newReceipt = {
      id: "rec-" + Date.now(),
      receipt_number: `REC-2026-${String(count).padStart(3, "0")}`,
      supplier: receipt.supplier || "General Vendor",
      warehouse_id: receipt.warehouse_id || "wh-1",
      warehouse_name: receipt.warehouse_name || "Main Warehouse",
      location_name: receipt.location_name || "Receiving Bay 01",
      status: receipt.status || "Draft",
      notes: receipt.notes || "",
      items: receipt.items || [],
      created_at: new Date().toISOString(),
    };

    receipts.unshift(newReceipt);
    setLocal(STORAGE_KEYS.RECEIPTS, receipts);
    return newReceipt;
  },

  async updateReceiptStatus(receiptId, status) {
    const receipts = this.getReceipts();
    const target = receipts.find((r) => r.id === receiptId);
    if (!target) throw new Error("Receipt not found");

    target.status = status;
    setLocal(STORAGE_KEYS.RECEIPTS, receipts);
    return target;
  },

  async validateReceipt(receiptId, operator = "Inventory Manager") {
    const receipts = this.getReceipts();
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt) throw new Error("Receipt not found");
    if (receipt.status === "Done") throw new Error("Receipt already validated.");

    // Update stock for every received item
    for (const item of receipt.items) {
      const qty = Number(item.received_qty || item.expected_qty || 0);
      if (qty > 0) {
        const { newStock } = await this.adjustProductStockInDb(item.product_id, qty);

        // Record in ledger
        await this.addLedgerEntry({
          reference_number: receipt.receipt_number,
          document_type: "RECEIPT",
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          from_location: receipt.supplier,
          to_location: `${receipt.warehouse_name} // ${receipt.location_name || "Dock"}`,
          quantity_delta: qty,
          stock_after: newStock,
          unit: item.unit || "pcs",
          operator,
          notes: `Vendor Receipt ${receipt.receipt_number} validated (+${qty} ${item.unit}).`,
        });
      }
    }

    receipt.status = "Done";
    receipt.validated_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.RECEIPTS, receipts);
    return receipt;
  },

  // ----------------------------------------------------
  // DELIVERIES (OUTGOING GOODS)
  // ----------------------------------------------------
  getDeliveries() {
    return getLocal(STORAGE_KEYS.DELIVERIES, SEED_OPERATIONS.deliveries);
  },

  async createDelivery(delivery) {
    const deliveries = this.getDeliveries();
    const count = deliveries.length + 1;
    const newDelivery = {
      id: "del-" + Date.now(),
      delivery_number: `DEL-2026-${String(count).padStart(3, "0")}`,
      customer: delivery.customer || "General Client",
      warehouse_id: delivery.warehouse_id || "wh-1",
      warehouse_name: delivery.warehouse_name || "Main Warehouse",
      location_name: delivery.location_name || "Shipping Bay 01",
      status: delivery.status || "Draft",
      notes: delivery.notes || "",
      items: delivery.items || [],
      created_at: new Date().toISOString(),
    };

    deliveries.unshift(newDelivery);
    setLocal(STORAGE_KEYS.DELIVERIES, deliveries);
    return newDelivery;
  },

  async updateDeliveryStatus(deliveryId, status) {
    const deliveries = this.getDeliveries();
    const target = deliveries.find((d) => d.id === deliveryId);
    if (!target) throw new Error("Delivery order not found");

    target.status = status;
    setLocal(STORAGE_KEYS.DELIVERIES, deliveries);
    return target;
  },

  async validateDelivery(deliveryId, operator = "Warehouse Staff") {
    const deliveries = this.getDeliveries();
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) throw new Error("Delivery order not found");
    if (delivery.status === "Done") throw new Error("Delivery order already validated.");

    // Validate quantities
    for (const item of delivery.items) {
      const qty = Number(item.picked_qty || item.ordered_qty || 0);
      if (qty > 0) {
        const { newStock } = await this.adjustProductStockInDb(item.product_id, -qty);

        // Record in ledger
        await this.addLedgerEntry({
          reference_number: delivery.delivery_number,
          document_type: "DELIVERY",
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          from_location: `${delivery.warehouse_name} // ${delivery.location_name || "Bay"}`,
          to_location: delivery.customer,
          quantity_delta: -qty,
          stock_after: newStock,
          unit: item.unit || "pcs",
          operator,
          notes: `Customer Delivery ${delivery.delivery_number} shipped (-${qty} ${item.unit}).`,
        });
      }
    }

    delivery.status = "Done";
    delivery.validated_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.DELIVERIES, deliveries);
    return delivery;
  },

  // ----------------------------------------------------
  // INTERNAL TRANSFERS
  // ----------------------------------------------------
  getTransfers() {
    return getLocal(STORAGE_KEYS.TRANSFERS, SEED_OPERATIONS.transfers);
  },

  async createTransfer(transfer) {
    const transfers = this.getTransfers();
    const count = transfers.length + 1;
    const newTransfer = {
      id: "trf-" + Date.now(),
      transfer_number: `TRF-2026-${String(count).padStart(3, "0")}`,
      product_id: transfer.product_id,
      product_name: transfer.product_name,
      sku: transfer.sku,
      source_warehouse: transfer.source_warehouse || "Main Warehouse",
      source_location: transfer.source_location || "Rack A",
      dest_warehouse: transfer.dest_warehouse || "Production Rack",
      dest_location: transfer.dest_location || "Production Floor",
      quantity: Number(transfer.quantity || 0),
      unit: transfer.unit || "pcs",
      status: transfer.status || "Waiting",
      notes: transfer.notes || "",
      created_at: new Date().toISOString(),
    };

    transfers.unshift(newTransfer);
    setLocal(STORAGE_KEYS.TRANSFERS, transfers);
    return newTransfer;
  },

  async updateTransferStatus(transferId, status) {
    const transfers = this.getTransfers();
    const target = transfers.find((t) => t.id === transferId);
    if (!target) throw new Error("Transfer not found");

    target.status = status;
    setLocal(STORAGE_KEYS.TRANSFERS, transfers);
    return target;
  },

  async validateTransfer(transferId, operator = "Warehouse Staff") {
    const transfers = this.getTransfers();
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer) throw new Error("Transfer not found");
    if (transfer.status === "Done") throw new Error("Transfer already validated.");

    // Fetch product to verify stock exists
    const { data: prod } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", transfer.product_id)
      .single();

    const currentTotal = prod?.stock_quantity ?? 0;

    // Record ledger entry
    await this.addLedgerEntry({
      reference_number: transfer.transfer_number,
      document_type: "TRANSFER",
      product_id: transfer.product_id,
      product_name: transfer.product_name,
      sku: transfer.sku,
      from_location: `${transfer.source_warehouse} (${transfer.source_location})`,
      to_location: `${transfer.dest_warehouse} (${transfer.dest_location})`,
      quantity_delta: 0,
      movement_quantity: transfer.quantity,
      stock_after: currentTotal,
      unit: transfer.unit || "pcs",
      operator,
      notes: `Relocated ${transfer.quantity} ${transfer.unit} internally.`,
    });

    transfer.status = "Done";
    transfer.completed_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.TRANSFERS, transfers);
    return transfer;
  },

  // ----------------------------------------------------
  // STOCK ADJUSTMENTS
  // ----------------------------------------------------
  getAdjustments() {
    return getLocal(STORAGE_KEYS.ADJUSTMENTS, SEED_OPERATIONS.adjustments);
  },

  async createAndValidateAdjustment(adjustment, operator = "Inventory Manager") {
    const adjustments = this.getAdjustments();
    const count = adjustments.length + 1;
    const diff = Number(adjustment.counted_qty) - Number(adjustment.recorded_qty);

    const newAdj = {
      id: "adj-" + Date.now(),
      adjustment_number: `ADJ-2026-${String(count).padStart(3, "0")}`,
      product_id: adjustment.product_id,
      product_name: adjustment.product_name,
      sku: adjustment.sku,
      warehouse_name: adjustment.warehouse_name || "Main Warehouse",
      location_name: adjustment.location_name || "Floor",
      recorded_qty: Number(adjustment.recorded_qty),
      counted_qty: Number(adjustment.counted_qty),
      difference_qty: diff,
      reason: adjustment.reason || "Physical Count Mismatch",
      notes: adjustment.notes || "",
      status: "Done",
      created_at: new Date().toISOString(),
    };

    // Update product stock directly in Supabase
    const { newStock } = await this.adjustProductStockInDb(adjustment.product_id, diff);

    // Record in ledger
    await this.addLedgerEntry({
      reference_number: newAdj.adjustment_number,
      document_type: "ADJUSTMENT",
      product_id: adjustment.product_id,
      product_name: adjustment.product_name,
      sku: adjustment.sku,
      from_location: `${newAdj.warehouse_name} // ${newAdj.location_name}`,
      to_location: diff < 0 ? "Inventory Loss / Scrap" : "Inventory Surplus",
      quantity_delta: diff,
      stock_after: newStock,
      unit: adjustment.unit || "pcs",
      operator,
      notes: `Adjustment (${newAdj.reason}): ${diff > 0 ? "+" : ""}${diff} ${adjustment.unit}.`,
    });

    adjustments.unshift(newAdj);
    setLocal(STORAGE_KEYS.ADJUSTMENTS, adjustments);
    return newAdj;
  },

  // ----------------------------------------------------
  // STOCK LEDGER (AUDIT TRAIL / MOVE HISTORY)
  // ----------------------------------------------------
  getLedgerEntries() {
    return getLocal(STORAGE_KEYS.LEDGER, SEED_OPERATIONS.ledger);
  },

  async addLedgerEntry(entry) {
    const ledger = this.getLedgerEntries();
    const newEntry = {
      id: "led-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      ...entry,
    };
    ledger.unshift(newEntry);
    setLocal(STORAGE_KEYS.LEDGER, ledger);
    return newEntry;
  },

  // ----------------------------------------------------
  // DASHBOARD METRICS & UNIFIED STREAM
  // ----------------------------------------------------
  async getDashboardData(filters = {}) {
    const products = await this.getProducts();
    const receipts = this.getReceipts();
    const deliveries = this.getDeliveries();
    const transfers = this.getTransfers();
    const adjustments = this.getAdjustments();
    const ledger = this.getLedgerEntries();
    const warehouses = await this.getWarehouses();

    // KPIs
    const totalProducts = products.length;
    const totalStockUnits = products.reduce(
      (sum, p) => sum + Number(p.stock_quantity || 0),
      0
    );

    const lowStockProducts = products.filter((p) => {
      const stock = Number(p.stock_quantity || 0);
      const min = Number(p.minimum_stock || 0);
      return stock > 0 && stock <= min;
    });

    const outOfStockProducts = products.filter(
      (p) => Number(p.stock_quantity || 0) === 0
    );

    const pendingReceipts = receipts.filter(
      (r) => r.status === "Draft" || r.status === "Waiting" || r.status === "Ready"
    ).length;

    const pendingDeliveries = deliveries.filter(
      (d) => d.status === "Draft" || d.status === "Waiting" || d.status === "Ready"
    ).length;

    const scheduledTransfers = transfers.filter(
      (t) => t.status === "Draft" || t.status === "Waiting" || t.status === "In Transit"
    ).length;

    // Unified Operations List for matrix filter
    const allOperations = [
      ...receipts.map((r) => ({
        id: r.id,
        reference: r.receipt_number,
        type: "Receipts",
        partner: r.supplier,
        warehouse: r.warehouse_name,
        location: r.location_name,
        status: r.status,
        date: r.created_at,
        itemCount: r.items?.length || 1,
        summary: r.items?.map((i) => `${i.product_name} (${i.expected_qty} ${i.unit})`).join(", ") || "General goods",
        category: r.items?.[0]?.category || "Raw Material",
        raw: r,
      })),
      ...deliveries.map((d) => ({
        id: d.id,
        reference: d.delivery_number,
        type: "Delivery",
        partner: d.customer,
        warehouse: d.warehouse_name,
        location: d.location_name,
        status: d.status,
        date: d.created_at,
        itemCount: d.items?.length || 1,
        summary: d.items?.map((i) => `${i.product_name} (${i.ordered_qty} ${i.unit})`).join(", ") || "Client shipment",
        category: d.items?.[0]?.category || "Furniture",
        raw: d,
      })),
      ...transfers.map((t) => ({
        id: t.id,
        reference: t.transfer_number,
        type: "Internal",
        partner: `${t.source_warehouse} → ${t.dest_warehouse}`,
        warehouse: t.source_warehouse,
        location: t.source_location,
        status: t.status,
        date: t.created_at,
        itemCount: 1,
        summary: `${t.product_name} (${t.quantity} ${t.unit})`,
        category: "Internal Move",
        raw: t,
      })),
      ...adjustments.map((a) => ({
        id: a.id,
        reference: a.adjustment_number,
        type: "Adjustments",
        partner: a.reason,
        warehouse: a.warehouse_name,
        location: a.location_name,
        status: a.status,
        date: a.created_at,
        itemCount: 1,
        summary: `${a.product_name} (${a.difference_qty > 0 ? "+" : ""}${a.difference_qty})`,
        category: "Adjustment",
        raw: a,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter operations matrix
    const filteredOperations = allOperations.filter((op) => {
      if (filters.docType && filters.docType !== "ALL" && op.type !== filters.docType) {
        return false;
      }
      if (filters.status && filters.status !== "ALL" && op.status !== filters.status) {
        return false;
      }
      if (filters.warehouse && filters.warehouse !== "ALL" && op.warehouse !== filters.warehouse) {
        return false;
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const match =
          op.reference.toLowerCase().includes(query) ||
          op.partner.toLowerCase().includes(query) ||
          op.summary.toLowerCase().includes(query) ||
          op.warehouse.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });

    return {
      kpis: {
        totalProducts,
        totalStockUnits,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
      },
      lowStockProducts,
      outOfStockProducts,
      operations: filteredOperations,
      ledgerSample: ledger.slice(0, 10),
      warehouses,
      products,
    };
  },
};

// Initialize seeds on import
inventoryService.init();
