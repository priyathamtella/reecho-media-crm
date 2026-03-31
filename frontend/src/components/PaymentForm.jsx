import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

// Using Vite env variable for Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sample_key_replace_me");
const API = "https://api.reechomedia.com/api";

const CheckoutForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // You'd typically redirect or handle success here. Since this is an SPA modal, we'll try to prevent redirect if possible, or handle it via return_url.
        return_url: window.location.origin + "/dashboard",
      },
      redirect: "if_required", // Prevent automatic redirect to allow SPA handling
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
    } else {
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <PaymentElement />
      {error && <div style={{ color: "var(--accent2)", fontSize: "13px", marginTop: "8px" }}>{error}</div>}
      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel} disabled={processing}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!stripe || processing}>
          {processing ? "Processing..." : `Pay ₹${amount.toLocaleString("en-IN")}`}
        </button>
      </div>
    </form>
  );
};

export default function PaymentForm({ amount, invoiceId, onSuccess, onCancel }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const token = localStorage.getItem("token");
        // Convert to smallest currency unit (paise for INR, cents for USD)
        // Adjust depending on the currency your backend expects. We'll use INR as default for this platform based on the UI.
        const res = await axios.post(
          `${API}/create-payment-intent`,
          { amount: amount * 100, currency: "inr", invoiceId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Failed to create payment intent", err);
      }
    };
    fetchIntent();
  }, [amount, invoiceId]);

  if (!clientSecret) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner" style={{ margin: "0 auto", width: "40px", height: "40px", border: "3px solid rgba(108,99,255,0.1)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <div style={{ marginTop: "16px", color: "var(--muted)", fontSize: "13px" }}>Loading secure payment...</div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: localStorage.getItem("theme") === "dark" ? 'night' : 'stripe',
      variables: {
        colorPrimary: '#6c63ff',
      },
    },
  };

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "24px", padding: "16px", background: "rgba(108,99,255,0.05)", borderRadius: "12px", border: "1px solid rgba(108,99,255,0.1)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white" }}>💳</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Total Payable</div>
          <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "'Clash Display'" }}>₹{amount.toLocaleString("en-IN")}</div>
        </div>
      </div>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}
