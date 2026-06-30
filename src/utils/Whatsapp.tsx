// src/utils/Whatsapp.ts
export const sendWhatsAppMessage = (phoneNumber: string, message: string): void => {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};

export const sendWhatsAppMessages = (phoneNumbers: string[], message: string): void => {
  const encodedMessage = encodeURIComponent(message);
  phoneNumbers.forEach((phone) => {
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  });
};

export const generateEnquiryMessage = (
  ganpatiName: string,
  ganpatiHeight: string,
  ganpatiPrice: number,
  customerName: string,
  customerPhone: string,
  customerMessage?: string
): string => {
  return `Ganpati Bappa Morya

New Enquiry

Ganpati Information:
Name: ${ganpatiName}
Height: ${ganpatiHeight}
Price: ₹${ganpatiPrice.toLocaleString()}

Customer Information:
Name: ${customerName}
Phone: ${customerPhone}
${customerMessage ? `Message: ${customerMessage}` : ''}

Please contact soon.

Siddhivinayak Arts`;
};