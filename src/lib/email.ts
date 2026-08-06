import { Resend } from "resend";
import { escapeHtml } from "./html-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "noreply@maison-pasha.com";
const SUPPLIER_EMAIL = process.env.SUPPLIER_EMAIL || "mandy@maison-pasha.com";

interface OrderNotification {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
}

/**
 * Send email notification to supplier about new order
 */
export async function sendOrderNotificationToSupplier(
  order: OrderNotification
) {
  try {
    const itemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(item.productName)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toFixed(2)} ${order.currency}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${(item.price * item.quantity).toFixed(2)} ${order.currency}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #d2691e; color: white; padding: 20px; border-radius: 4px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #d2691e; }
            .section h2 { margin-top: 0; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { background-color: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; }
            .total-row { background-color: #fff3e0; font-weight: bold; font-size: 18px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #d2691e; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Maison Pasha</h1>
              <p>Nouvelle Commande à Préparer</p>
            </div>

            <div class="section">
              <h2>📦 Détails de la Commande</h2>
              <p><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
              <p><strong>Total:</strong> <span style="font-size: 20px; color: #d2691e;">${order.totalAmount.toFixed(2)} ${order.currency}</span></p>
            </div>

            <div class="section">
              <h2>👤 Informations Client</h2>
              <p><strong>Nom:</strong> ${escapeHtml(order.customerName)}</p>
              <p><strong>Email:</strong> ${order.customerEmail}</p>
              <p><strong>Téléphone:</strong> ${order.customerPhone || "Non fourni"}</p>
              <p><strong>Adresse:</strong> ${escapeHtml(order.customerAddress || "Non fournie")}</p>
            </div>

            <div class="section">
              <h2>📋 Articles Commandés</h2>
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding: 10px;">TOTAL TTC:</td>
                    <td style="text-align: right; padding: 10px;">${order.totalAmount.toFixed(2)} ${order.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/orders" class="button">
                Voir la Commande dans le CRM
              </a>
            </div>

            <div class="footer">
              <p>Maison Pasha CRM - © 2024</p>
              <p>Cet email a été envoyé automatiquement. Veuillez ne pas répondre à cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPLIER_EMAIL,
      subject: `🎯 Nouvelle commande ${order.orderNumber} - Maison Pasha`,
      html,
    });

    return result;
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationToCustomer(
  order: OrderNotification
) {
  try {
    const itemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(item.productName)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toFixed(2)} ${order.currency}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${(item.price * item.quantity).toFixed(2)} ${order.currency}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #d2691e; color: white; padding: 20px; border-radius: 4px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #d2691e; }
            .section h2 { margin-top: 0; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { background-color: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; }
            .total-row { background-color: #fff3e0; font-weight: bold; font-size: 18px; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Maison Pasha</h1>
              <p>Confirmation de Votre Commande</p>
            </div>

            <div class="section">
              <h2>✓ Commande Confirmée</h2>
              <p>Merci pour votre achat ! Votre commande a été reçue et est en cours de préparation.</p>
              <p><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
            </div>

            <div class="section">
              <h2>📋 Résumé de votre Commande</h2>
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding: 10px;">TOTAL TTC:</td>
                    <td style="text-align: right; padding: 10px;">${order.totalAmount.toFixed(2)} ${order.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>📦 Livraison</h2>
              <p><strong>Adresse de livraison:</strong></p>
              <p>${escapeHtml(order.customerAddress || "Non fournie"}</p>
              <p>Vous recevrez un email avec le numéro de suivi dès que votre commande sera expédiée.</p>
            </div>

            <div class="section" style="background-color: #fff3e0; border-left-color: #ff9800;">
              <p>Des questions ? Contactez-nous à support@maison-pasha.com</p>
            </div>

            <div class="footer">
              <p>Maison Pasha - © 2024</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject: `Confirmation de commande ${order.orderNumber} - Maison Pasha`,
      html,
    });

    return result;
  } catch (error) {
    console.error("Error sending customer confirmation:", error);
    throw error;
  }
}
