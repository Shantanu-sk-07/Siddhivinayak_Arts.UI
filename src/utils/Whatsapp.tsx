// src/utils/whatsapp.ts

export const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};

export const getBookingWhatsAppMessage = (
  customerName: string,
  customerPhone: string,
  ganpatiName: string,
  price: number,
  bookingId: string
) => {
  return `🆕 NEW BOOKING REQUEST 🆕

📋 Booking Details:
🔹 Booking ID: ${bookingId}
🔹 Ganpati: ${ganpatiName}
🔹 Price: ₹${price.toLocaleString()}
🔹 Advance (30%): ₹${(price * 0.3).toLocaleString()}

👤 Customer Details:
🔹 Name: ${customerName}
🔹 Phone: ${customerPhone}

📌 Status: PENDING APPROVAL`;
};

export const getInterestWhatsAppMessage = (
  customerName: string,
  customerPhone: string,
  ganpatiName: string,
  price: number
) => {
  return `❤️ INTEREST IN GANPATI ❤️

🪔 Ganpati Details:
🔹 Name: ${ganpatiName}
🔹 Price: ₹${price.toLocaleString()}

👤 Customer Details:
🔹 Name: ${customerName}
🔹 Phone: ${customerPhone}

📞 Please contact customer for follow up!`;
};