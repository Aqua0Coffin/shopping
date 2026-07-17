"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentStatus: string;
  trackingNumber: string | null;
  nextStatuses: string[];
  canRefund: boolean;
  paymentStatus: string | null;
  paymentAmount: number;
}

export default function OrderDetailClient({
  orderId,
  currentStatus,
  trackingNumber,
  nextStatuses,
  canRefund,
  paymentStatus,
  paymentAmount,
}: Props) {
  const router = useRouter();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [tracking, setTracking] = useState(trackingNumber || "");
  const [refunding, setRefunding] = useState(false);
  const [refundMsg, setRefundMsg] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);

  const updateOrder = useCallback(
    async (data: Record<string, unknown>) => {
      setLoadingStatus(true);
      setStatusError(null);
      setStatusMsg(null);

      try {
        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok) {
          setStatusError(json.error || "Update failed.");
        } else {
          setStatusMsg("Order updated successfully.");
          router.refresh();
        }
      } catch {
        setStatusError("Network error. Please try again.");
      } finally {
        setLoadingStatus(false);
      }
    },
    [orderId, router]
  );

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      updateOrder({ status: newStatus, trackingNumber: tracking || null });
    },
    [updateOrder, tracking]
  );

  const handleTrackingSave = useCallback(() => {
    updateOrder({ trackingNumber: tracking || null });
  }, [updateOrder, tracking]);

  const handleRefund = useCallback(async () => {
    if (!confirm("Process a full refund for this order? This will call the Razorpay refund API and move real money. Are you sure?")) {
      return;
    }

    setRefunding(true);
    setRefundError(null);
    setRefundMsg(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (!res.ok) {
        setRefundError(json.error || "Refund failed.");
      } else {
        setRefundMsg(json.message || "Refund processed successfully.");
        router.refresh();
      }
    } catch {
      setRefundError("Network error during refund.");
    } finally {
      setRefunding(false);
    }
  }, [orderId, router]);

  return (
    <div className="border border-gold/10 bg-silk/10 p-4 space-y-4">
      {/* Status messages */}
      {statusMsg && (
        <p className="text-xs text-emerald-600 bg-emerald-50/50 px-3 py-2 border border-emerald-200/30">{statusMsg}</p>
      )}
      {statusError && (
        <p className="text-xs text-red-600 bg-red-50/50 px-3 py-2 border border-red-200/30">{statusError}</p>
      )}
      {refundMsg && (
        <p className="text-xs text-emerald-600 bg-emerald-50/50 px-3 py-2 border border-emerald-200/30">{refundMsg}</p>
      )}
      {refundError && (
        <p className="text-xs text-red-600 bg-red-50/50 px-3 py-2 border border-red-200/30">{refundError}</p>
      )}

      {/* Fulfillment Status Update */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">
          Fulfillment Status
        </h2>
        <div className="flex flex-wrap gap-2">
          {nextStatuses.length > 0 ? (
            nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loadingStatus}
                className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all duration-300 disabled:opacity-40 cursor-pointer ${
                  status === "refunded"
                    ? "border-crimson/50 text-crimson hover:bg-crimson/5"
                    : "border-gold/30 text-gold hover:bg-gold/5"
                }`}
              >
                {loadingStatus ? "Updating..." : `Mark as ${status}`}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted italic">
              No further status transitions available for &quot;{currentStatus}&quot; orders.
            </span>
          )}
        </div>
      </div>

      {/* Tracking Number */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">
          Tracking Reference
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Enter tracking number or courier reference..."
            className="flex-1 border border-gold/30 bg-transparent p-2.5 text-xs focus:outline-none focus:border-gold"
          />
          <button
            onClick={handleTrackingSave}
            disabled={loadingStatus}
            className="px-4 py-2 border border-gold/30 text-xs tracking-wider uppercase text-gold hover:bg-gold/5 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {loadingStatus ? "..." : "Save"}
          </button>
        </div>
      </div>

      {/* Refund Trigger */}
      {canRefund && (
        <div className="border-t border-gold/10 pt-4">
          <h2 className="text-xs uppercase tracking-widest text-crimson mb-3 font-semibold">
            Refund
          </h2>
          <p className="text-[10px] text-muted/80 mb-3">
            Payment status: {paymentStatus}. Amount: ₹{(paymentAmount / 100).toLocaleString("en-IN")}.
            This will issue a full refund via Razorpay.
          </p>
          <button
            onClick={handleRefund}
            disabled={refunding}
            className="px-5 py-2.5 border border-crimson/50 text-xs uppercase tracking-wider text-crimson hover:bg-crimson/5 transition-all duration-300 disabled:opacity-40 cursor-pointer"
          >
            {refunding ? "Processing Refund..." : "Issue Full Refund via Razorpay"}
          </button>
        </div>
      )}
    </div>
  );
}