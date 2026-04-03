package controllers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

func rzpKeyID() string     { return os.Getenv("RAZORPAY_KEY_ID") }
func rzpKeySecret() string { return os.Getenv("RAZORPAY_KEY_SECRET") }

// UpdateInvoiceStatus updates a single invoice's status in the database.
// Called by VerifyRazorpayPayment after successful signature verification.
func UpdateInvoiceStatus(invoiceID uint, status string) error {
	result := database.DB.Model(&models.Invoice{}).
		Where("id = ?", invoiceID).
		Update("status", status)
	return result.Error
}

// ─── CreateRazorpayOrder ──────────────────────────────────────────────────────
// POST /api/payment/create-order
//
// Request body:
//
//	{ "invoice_id": 5, "amount": 5000 }   ← amount is in INR (rupees)
//
// Response:
//
//	{ "order_id": "order_xxx", "amount": 500000, "currency": "INR", "razorpay_key": "rzp_test_xxx" }
func CreateRazorpayOrder(c *fiber.Ctx) error {
	var body struct {
		InvoiceID uint    `json:"invoice_id"`
		Amount    float64 `json:"amount"` // INR
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if body.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "amount must be greater than 0"})
	}

	// Razorpay accepts amounts in the smallest currency unit (paise for INR)
	amountPaise := int64(body.Amount * 100)

	payload := map[string]interface{}{
		"amount":   amountPaise,
		"currency": "INR",
		"receipt":  fmt.Sprintf("rcpt_inv_%d", body.InvoiceID),
		"notes": map[string]interface{}{
			"invoice_id": body.InvoiceID,
		},
	}
	payloadBytes, _ := json.Marshal(payload)

	req, err := http.NewRequest(
		"POST",
		"https://api.razorpay.com/v1/orders",
		bytes.NewReader(payloadBytes),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to build razorpay request"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(rzpKeyID(), rzpKeySecret())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "razorpay API unreachable"})
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var rzpResp map[string]interface{}
	if err := json.Unmarshal(respBody, &rzpResp); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to parse razorpay response"})
	}

	if resp.StatusCode != http.StatusOK {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error":   "razorpay order creation failed",
			"details": rzpResp,
		})
	}

	return c.JSON(fiber.Map{
		"order_id":     rzpResp["id"],
		"amount":       rzpResp["amount"],
		"currency":     rzpResp["currency"],
		"razorpay_key": rzpKeyID(),
	})
}

// ─── VerifyRazorpayPayment ────────────────────────────────────────────────────
// POST /api/payment/verify
//
// Request body (sent by Razorpay Checkout after successful payment):
//
//	{
//	  "razorpay_order_id":   "order_xxx",
//	  "razorpay_payment_id": "pay_xxx",
//	  "razorpay_signature":  "abc123...",
//	  "invoice_id":          5
//	}
//
// The server verifies the HMAC-SHA256 signature and then marks the invoice as Paid.
func VerifyRazorpayPayment(c *fiber.Ctx) error {
	var body struct {
		RazorpayOrderID   string `json:"razorpay_order_id"`
		RazorpayPaymentID string `json:"razorpay_payment_id"`
		RazorpaySignature string `json:"razorpay_signature"`
		InvoiceID         uint   `json:"invoice_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	// Verify Razorpay signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
	message := body.RazorpayOrderID + "|" + body.RazorpayPaymentID
	mac := hmac.New(sha256.New, []byte(rzpKeySecret()))
	mac.Write([]byte(message))
	expectedSig := fmt.Sprintf("%x", mac.Sum(nil))

	if expectedSig != body.RazorpaySignature {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "payment signature mismatch — possible tampering detected",
		})
	}

	// Signature valid → update invoice in DB
	if err := UpdateInvoiceStatus(body.InvoiceID, "Paid"); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update invoice status"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "payment verified and invoice marked as Paid",
	})
}
