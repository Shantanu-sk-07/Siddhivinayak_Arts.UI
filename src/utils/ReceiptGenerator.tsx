// src/utils/ReceiptGenerator.ts
import { ReceiptData } from '@/types/MurtiType';
import html2pdf from 'html2pdf.js';
import LOGO from '@/assets/images/Logo.avif';

export interface ReceiptDataWithHistory extends ReceiptData {
  paymentHistory?: Array<{
    amount: number;
    date: string;
    type: string;
    notes: string;
    remainingAfter: number;
  }>;
  totalPaidSoFar?: number;
}

export const generateReceiptHTML = (data: ReceiptDataWithHistory): string => {
  const contactsList = data.contactNumbers.map((num, idx) => 
    `<tr><td style="padding:4px 8px;border-bottom:1px dashed #eee;text-align:center;">${idx + 1}</td><td style="padding:4px 8px;border-bottom:1px dashed #eee;text-align:center;">${num}</td></tr>`
  ).join('');

  const paymentHistoryRows = (data.paymentHistory || []).map((record) => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px dashed #eee;font-size:11px;text-align:center;">${record.date}</td>
      <td style="padding:4px 8px;border-bottom:1px dashed #eee;font-size:11px;font-weight:600;color:#2e7d32;text-align:center;">₹${record.amount.toLocaleString()}</td>
      <td style="padding:4px 8px;border-bottom:1px dashed #eee;font-size:11px;text-align:center;">${record.type}</td>
      <td style="padding:4px 8px;border-bottom:1px dashed #eee;font-size:11px;font-weight:600;color:#d32f2f;text-align:center;">₹${record.remainingAfter.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>पावती - ${data.receiptNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif;
          background: #f5f0eb;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          min-height: 100vh;
          margin: 0;
        }
        .receipt {
          max-width: 500px;
          width: 100%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          overflow: hidden;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #d32f2f, #b71c1c);
          color: white;
          padding: 16px 20px;
          text-align: center;
        }
        .header-logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
        }
        .header-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .header h1 { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
        .header .subtitle { font-size: 11px; opacity: 0.9; margin-top: 2px; }
        .header .ganpati-bappa { font-size: 14px; margin-top: 4px; font-weight: 600; }
        .content { padding: 16px 20px; }
        .receipt-number {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-bottom: 12px;
          padding: 6px 10px;
          background: #f8f4f0;
          border-radius: 6px;
        }
        .receipt-number strong { color: #d32f2f; font-size: 14px; }
        .section { margin-bottom: 12px; }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: #d32f2f;
          border-bottom: 2px solid #d32f2f;
          padding-bottom: 3px;
          margin-bottom: 6px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 12px;
          border-bottom: 1px dashed #eee;
        }
        .row .label { color: #555; font-weight: 500; }
        .row .value { color: #1a1a1a; font-weight: 600; }
        .row .value.price { color: #d32f2f; font-size: 13px; }
        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        .payment-table th {
          background: #f8f4f0;
          padding: 4px 6px;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          color: #555;
          border-bottom: 2px solid #d32f2f;
        }
        .payment-table td {
          padding: 3px 6px;
          font-size: 10px;
          border-bottom: 1px dashed #eee;
          text-align: center;
        }
        .contacts-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
        }
        .contacts-table td {
          padding: 2px 0;
          font-size: 11px;
          border-bottom: 1px dashed #eee;
          text-align: center;
        }
        .contacts-table td:last-child { font-weight: 600; color: #1a1a1a; }
        .footer {
          text-align: center;
          padding: 12px 20px;
          background: #f8f4f0;
          border-top: 1px solid #e0d6ce;
        }
        .footer .thank-you { font-size: 16px; font-weight: 700; color: #d32f2f; }
        .footer .message { font-size: 10px; color: #666; margin-top: 2px; }
        .footer .bappa { font-size: 14px; font-weight: 600; color: #b71c1c; margin-top: 4px; }
        @media print {
          body { background: white; padding: 0; }
          .receipt { box-shadow: none; border-radius: 0; max-width: 100%; }
        }
        @media (max-width: 480px) {
          .content { padding: 12px 14px; }
          .row { font-size: 11px; }
          .header h1 { font-size: 16px; }
          .payment-table td, .payment-table th { font-size: 9px; padding: 2px 4px; }
        }
      </style>
    </head>
    <body>
      <div class="receipt" id="receipt-content">
        <div class="header">
          <div class="header-logo">
            <img src="${LOGO}" alt="Logo" />
          </div>
          <h1>सिद्धिविनायक आर्ट्स</h1>
          <div class="subtitle">गणपती मूर्ती बुकिंग पावती</div>
          <div class="ganpati-bappa">🌺 गणपती बाप्पा मोरया 🌺</div>
        </div>
        
        <div class="content">
          <div class="receipt-number">
            <strong>पावती क्रमांक:</strong> ${data.receiptNumber}
          </div>
          
          <div class="section">
            <div class="section-title">📋 ग्राहक माहिती</div>
            <div class="row"><span class="label">नाव</span><span class="value">${data.customerName}</span></div>
            <div class="row"><span class="label">मोबाईल</span><span class="value">${data.customerPhone}</span></div>
            ${data.customerEmail ? `<div class="row"><span class="label">ईमेल</span><span class="value">${data.customerEmail}</span></div>` : ''}
            ${data.mandalName ? `<div class="row"><span class="label">मंडळ</span><span class="value">${data.mandalName}</span></div>` : ''}
            ${data.customerAddress ? `<div class="row"><span class="label">पत्ता</span><span class="value">${data.customerAddress}</span></div>` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">🗿 गणपती माहिती</div>
            <div class="row"><span class="label">नाव</span><span class="value">${data.ganpatiName}</span></div>
            <div class="row"><span class="label">उंची</span><span class="value">${data.ganpatiHeight}</span></div>
            <div class="row"><span class="label">एकूण किंमत</span><span class="value price">₹${data.ganpatiPrice.toLocaleString()}</span></div>
          </div>
          
          <div class="section">
            <div class="section-title">💰 पेमेंट तपशील</div>
            <div class="row"><span class="label">एकूण किंमत</span><span class="value price">₹${data.totalPrice.toLocaleString()}</span></div>
            <div class="row"><span class="label">आतापर्यंत भरले</span><span class="value price" style="color:#2e7d32;">₹${(data.totalPaidSoFar || 0).toLocaleString()}</span></div>
            <div class="row"><span class="label">बाकी रक्कम</span><span class="value price">₹${data.remainingPayment.toLocaleString()}</span></div>
          </div>

          ${data.paymentHistory && data.paymentHistory.length > 0 ? `
          <div class="section">
            <div class="section-title">📜 पेमेंट हिस्ट्री</div>
            <table class="payment-table">
              <thead>
                <tr>
                  <th>तारीख</th>
                  <th>रक्कम</th>
                  <th>प्रकार</th>
                  <th>बाकी</th>
                </tr>
              </thead>
              <tbody>
                ${paymentHistoryRows}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">📅 बुकिंग तपशील</div>
            <div class="row"><span class="label">बुकिंग तारीख</span><span class="value">${data.bookingDate}</span></div>
            <div class="row"><span class="label">स्थिती</span><span class="value" style="color: ${data.status === 'COMPLETED' ? '#2e7d32' : '#ed6c02'}; font-weight:700;">${data.status === 'COMPLETED' ? '✅ पूर्ण' : data.status === 'PENDING' ? '⏳ प्रलंबित' : data.status}</span></div>
          </div>
          
          ${data.contactNumbers.length > 0 ? `
          <div class="section">
            <div class="section-title">📞 संपर्क क्रमांक</div>
            <table class="contacts-table">
              ${contactsList}
            </table>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <div class="thank-you">🙏 धन्यवाद! 🙏</div>
          <div class="message">आपल्या विश्वासाबद्दल हार्दिक आभार</div>
          <div class="bappa">🌺 गणपती बाप्पा मोरया 🌺</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceiptPDF = async (data: ReceiptDataWithHistory): Promise<void> => {
  const element = document.createElement('div');
  element.innerHTML = generateReceiptHTML(data);
  // Ensure the element is properly styled for PDF generation
  element.style.display = 'flex';
  element.style.justifyContent = 'center';
  element.style.alignItems = 'center';
  element.style.width = '100%';
  element.style.background = '#f5f0eb';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `Receipt-${data.receiptNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      width: 500, // Set fixed width for consistent rendering
      windowWidth: 500
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const // Fixed: explicitly set as 'portrait'
    },
    pagebreak: { mode: 'avoid-all' as const }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('PDF download failed. Please try again.');
  } finally {
    document.body.removeChild(element);
  }
};

export const generateReceiptMessage = (data: ReceiptDataWithHistory): string => {
  const contactsList = data.contactNumbers.map((num, idx) => 
    `${idx + 1}. ${num}`
  ).join('\n');

  const paymentHistoryText = (data.paymentHistory || []).map((record, idx) => 
    `${idx + 1}. ${record.date} - ₹${record.amount.toLocaleString()} (${record.type}) - बाकी: ₹${record.remainingAfter.toLocaleString()}`
  ).join('\n');

  return `🙏 *गणपती बाप्पा मोरया!* 🙏

*सिद्धिविनायक आर्ट्स*
गणपती मूर्ती बुकिंग पावती

━━━━━━━━━━━━━━━━━━━━
*पावती क्रमांक:* ${data.receiptNumber}
*तारीख:* ${data.date}
━━━━━━━━━━━━━━━━━━━━

*📋 ग्राहक माहिती:*
नाव: ${data.customerName}
मोबाईल: ${data.customerPhone}
${data.mandalName ? `मंडळ: ${data.mandalName}` : ''}
${data.customerAddress ? `पत्ता: ${data.customerAddress}` : ''}

*🗿 गणपती माहिती:*
नाव: ${data.ganpatiName}
उंची: ${data.ganpatiHeight}
किंमत: ₹${data.ganpatiPrice.toLocaleString()}

*💰 पेमेंट तपशील:*
एकूण किंमत: ₹${data.totalPrice.toLocaleString()}
आतापर्यंत भरले: ₹${(data.totalPaidSoFar || 0).toLocaleString()}
बाकी रक्कम: ₹${data.remainingPayment.toLocaleString()}

${data.paymentHistory && data.paymentHistory.length > 0 ? `
*📜 पेमेंट हिस्ट्री:*
${paymentHistoryText}
` : ''}

*📅 बुकिंग तपशील:*
बुकिंग तारीख: ${data.bookingDate}
स्थिती: ${data.status === 'COMPLETED' ? '✅ पूर्ण' : data.status === 'PENDING' ? '⏳ प्रलंबित' : data.status}

${data.contactNumbers.length > 0 ? `
*📞 संपर्क क्रमांक:*
${contactsList}
` : ''}

━━━━━━━━━━━━━━━━━━━━
🙏 *गणपती बाप्पा मोरया!* 🙏
आपल्या विश्वासाबद्दल धन्यवाद!`;
};