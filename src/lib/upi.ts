/**
 * Utility for generating UPI payment links and QR Codes.
 */

export interface UpiPaymentOptions {
  payeeAddress: string;     // pa: Merchant UPI ID (e.g., merchant@upi)
  payeeName: string;        // pn: Merchant Name
  amount?: number;          // am: Payment Amount (Optional, can be entered by user if omitted)
  transactionNote?: string; // tn: Transaction Note (e.g., Order #1234)
  transactionRefId?: string;// tr: Transaction Reference ID (Unique Order ID)
  currency?: string;        // cu: Currency (Default: INR)
}

/**
 * Generates a UPI intent link that can be used directly on mobile devices
 * to open UPI apps (GPay, PhonePe, Paytm, etc.) or embedded in a QR code.
 */
export function generateUpiLink(options: UpiPaymentOptions): string {
  const url = new URL("upi://pay");
  url.searchParams.append("pa", options.payeeAddress);
  url.searchParams.append("pn", options.payeeName);
  
  if (options.amount) {
    url.searchParams.append("am", options.amount.toFixed(2));
  }
  
  if (options.transactionNote) {
    url.searchParams.append("tn", options.transactionNote);
  }
  
  if (options.transactionRefId) {
    url.searchParams.append("tr", options.transactionRefId);
  }

  url.searchParams.append("cu", options.currency || "INR");

  return url.toString();
}
