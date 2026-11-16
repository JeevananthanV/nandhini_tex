"use client";

/**
 * Razorpay Checkout client-side loader.
 *
 * Loads the Razorpay Checkout script (https://checkout.razorpay.com/v1/checkout.js)
 * on demand and opens the payment modal.
 *
 * Flow:
 * 1. POST /api/payments/razorpay/create-order { orderId } → { razorpayOrderId, amount, keyId }
 * 2. new Razorpay({ key, amount, order_id, ... }).open()
 * 3. Razorpay modal opens → customer pays → returns { razorpay_payment_id, razorpay_signature }
 * 4. POST /api/payments/razorpay/verify { ... } → marks order as paid
 *
 * The component is loaded dynamically (code-split) so the 50KB Razorpay script
 * only loads when the user actually selects an online payment method.
 */

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number; // in paise
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow retry
      reject(new Error("Failed to load Razorpay Checkout script"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type RazorpayPaymentParams = {
  orderNumber: string;       // our internal order number (NTX...)
  amountInRupees: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
};

export type RazorpayPaymentResult =
  | { success: true; paymentId: string; method: string }
  | { success: false; error: string; code?: string };

/**
 * Open the Razorpay Checkout modal and process the payment.
 *
 * @returns Promise that resolves when payment is verified (success) or fails.
 *          Never throws — always returns a result object.
 */
export async function openRazorpayCheckout(params: RazorpayPaymentParams): Promise<RazorpayPaymentResult> {
  try {
    // 1. Load the Razorpay script
    await loadRazorpayScript();
    if (!window.Razorpay) {
      return { success: false, error: "Razorpay Checkout failed to load", code: "SCRIPT_LOAD_FAILED" };
    }

    // 2. Create a Razorpay Order on our server
    const createRes = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: params.orderNumber }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({ error: "Unknown error" }));
      return {
        success: false,
        error: errData.error || "Failed to create payment order",
        code: errData.code || "CREATE_FAILED",
      };
    }

    const createData = await createRes.json() as {
      razorpayOrderId: string;
      amount: number; // paise
      currency: string;
      keyId: string;
      receipt: string;
    };

    // 3. Open the Razorpay Checkout modal
    const paymentResult = await new Promise<{ success: true; paymentId: string; method: string } | { success: false; error: string; code?: string }>((resolve) => {
      const rzp = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: "Nandhini Tex",
        description: `Order ${params.orderNumber}`,
        image: "/logo.svg",
        prefill: {
          name: params.customerName,
          email: params.customerEmail || undefined,
          contact: params.customerPhone,
        },
        notes: {
          order_number: params.orderNumber,
          source: "nandhini-tex-web",
        },
        theme: { color: "#081B3A" }, // Navy
        handler: async (response) => {
          // 4. Verify the payment signature on our server
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderNumber: params.orderNumber,
              }),
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({ error: "Verification failed" }));
              resolve({ success: false, error: errData.error || "Payment verification failed", code: "VERIFY_FAILED" });
              return;
            }

            const verifyData = await verifyRes.json() as {
              success: boolean;
              paymentMethod?: string;
              paymentId?: string;
            };

            if (verifyData.success) {
              resolve({
                success: true,
                paymentId: verifyData.paymentId || response.razorpay_payment_id,
                method: verifyData.paymentMethod || "online",
              });
            } else {
              resolve({ success: false, error: "Payment verification failed", code: "VERIFY_FAILED" });
            }
          } catch (err) {
            resolve({
              success: false,
              error: err instanceof Error ? err.message : "Network error during verification",
              code: "NETWORK_ERROR",
            });
          }
        },
        modal: {
          ondismiss: () => {
            resolve({ success: false, error: "Payment cancelled by user", code: "USER_CANCELLED" });
          },
        },
      });

      rzp.on("payment.failed", (response: unknown) => {
        const err = response as { error?: { description?: string; code?: string } };
        resolve({
          success: false,
          error: err.error?.description || "Payment failed",
          code: err.error?.code || "PAYMENT_FAILED",
        });
      });

      rzp.open();
    });

    return paymentResult;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      code: "UNEXPECTED_ERROR",
    };
  }
}
