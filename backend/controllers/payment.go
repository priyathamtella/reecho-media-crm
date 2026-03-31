package controllers

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/paymentintent"
	"github.com/stripe/stripe-go/v78/webhook"
)

type PaymentRequest struct {
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	InvoiceID uint   `json:"invoiceId"`
}

func HandleCreatePaymentIntent(c *fiber.Ctx) error {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	var req PaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Amount < 50 { 
		return c.Status(400).JSON(fiber.Map{"error": "Amount must be at least 50 cents/paise"})
	}
	if req.Currency == "" {
		req.Currency = "inr" // default to INR
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(req.Amount),
		Currency: stripe.String(req.Currency),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}
	
	// Track invoice correlation
	if req.InvoiceID > 0 {
		params.AddMetadata("invoice_id", fmt.Sprintf("%d", req.InvoiceID))
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"clientSecret": pi.ClientSecret,
	})
}

func HandleStripeWebhook(c *fiber.Ctx) error {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	payload := c.Body()
	
	// Verify webhook signature if secret provided
	var event stripe.Event
	var err error
	
	if endpointSecret != "" {
		signatureHeader := c.Get("Stripe-Signature")
		event, err = webhook.ConstructEvent(payload, signatureHeader, endpointSecret)
		if err != nil {
			fmt.Printf("⚠️  Webhook signature verification failed: %v\n", err)
			return c.SendStatus(fiber.StatusBadRequest)
		}
	} else {
		// Fallback for development if secret not set
		if err = json.Unmarshal(payload, &event); err != nil {
			fmt.Printf("⚠️  Webhook payload read failed: %v\n", err)
			return c.SendStatus(fiber.StatusBadRequest)
		}
	}

	// Handle the event securely
	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		fmt.Println("PaymentIntent successfully completed:", paymentIntent.ID)
		
		// Map the matched invoice_id from the metadata
		invoiceIDStr, ok := paymentIntent.Metadata["invoice_id"]
		if ok {
			invoiceID, _ := strconv.Atoi(invoiceIDStr)
			var invoice models.Invoice
			if err := database.DB.First(&invoice, invoiceID).Error; err == nil {
				invoice.Status = "Paid"
				database.DB.Save(&invoice)
				fmt.Printf("✅ Automatically marked Invoice %d as Paid via Stripe Webhook!\n", invoiceID)
			}
		}
	default:
		fmt.Printf("Unhandled event type: %s\n", event.Type)
	}

	return c.SendStatus(fiber.StatusOK)
}
