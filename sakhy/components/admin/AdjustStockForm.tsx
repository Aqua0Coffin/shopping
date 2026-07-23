"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdjustStockFormProps {
  variantId: string;
  currentStockQty: number;
}

const REASONS = [
  { value: "restock", label: "Restock" },
  { value: "adjustment", label: "Correction / Adjustment" },
  { value: "return", label: "Customer Return" },
] as const;

type Reason = (typeof REASONS)[number]["value"];

export default function AdjustStockForm({
  variantId,
  currentStockQty,
}: AdjustStockFormProps) {
  const router = useRouter();

  const [delta, setDelta] = useState<string>("");
  const [reason, setReason] = useState<Reason>("restock");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const deltaNum = parseInt(delta, 10);
  const isValidDelta = !isNaN(deltaNum) && deltaNum !== 0;
  const wouldGoNegative = isValidDelta && currentStockQty + deltaNum < 0;
  const clientError = wouldGoNegative
    ? `Adjustment of ${deltaNum > 0 ? "+" : ""}${deltaNum} would result in negative stock (${currentStockQty + deltaNum}).`
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);

    if (!isValidDelta || wouldGoNegative) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inventory/${variantId}/adjust`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delta: deltaNum,
          reason,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Adjustment failed.");
        return;
      }

      setSuccess(`Stock updated to ${data.newStockQty}. Audit log entry created.`);
      setDelta("");
      setNote("");
      router.refresh(); // Reload server component to show updated numbers
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal placeholder:text-muted/60 focus:outline-none focus:border-gold/60 transition-colors duration-200";

  const labelBase = "block text-[10px] uppercase tracking-widest text-muted mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="adjust-stock-form">
      {/* Delta input */}
      <div>
        <label htmlFor="adjust-delta" className={labelBase}>
          Quantity Change
        </label>
        <input
          id="adjust-delta"
          type="number"
          step="1"
          placeholder="e.g. +5 or -2"
          value={delta}
          onChange={(e) => {
            setDelta(e.target.value);
            setServerError(null);
            setSuccess(null);
          }}
          className={inputBase}
          required
          disabled={loading}
        />
        <p className="mt-1.5 text-[10px] text-muted">
          Current stock: <span className="text-charcoal font-medium">{currentStockQty}</span>
          {isValidDelta && !wouldGoNegative && (
            <span className="ml-2 text-emerald-900">
              → New: {currentStockQty + deltaNum}
            </span>
          )}
        </p>
        {clientError && (
          <p className="mt-1.5 text-[11px] text-crimson font-medium">{clientError}</p>
        )}
      </div>

      {/* Reason select */}
      <div>
        <label htmlFor="adjust-reason" className={labelBase}>
          Reason
        </label>
        <select
          id="adjust-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as Reason)}
          className={inputBase}
          disabled={loading}
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="adjust-note" className={labelBase}>
          Note <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="adjust-note"
          rows={2}
          maxLength={300}
          placeholder="Reason for adjustment, batch number, etc."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputBase} resize-none`}
          disabled={loading}
        />
      </div>

      {/* Server feedback */}
      {serverError && (
        <p
          className="text-[11px] text-crimson font-medium border border-crimson/20 bg-crimson/5 px-3 py-2"
          role="alert"
        >
          {serverError}
        </p>
      )}
      {success && (
        <p
          className="text-[11px] text-emerald-900 font-medium border border-emerald-900/20 bg-emerald-900/5 px-3 py-2"
          role="status"
        >
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !isValidDelta || wouldGoNegative}
        className="text-[10px] uppercase tracking-widest px-5 py-2.5 bg-gold text-deep font-medium hover:bg-gold-light transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Saving…" : "Apply Adjustment"}
      </button>
    </form>
  );
}
