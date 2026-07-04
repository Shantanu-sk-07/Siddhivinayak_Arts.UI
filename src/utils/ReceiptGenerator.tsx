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
  const contactsList = data.contactNumbers
    .map(
      (num, idx) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0ebe6;text-align:center;font-size:13px;">${idx + 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0ebe6;text-align:center;font-size:13px;font-weight:500;">${num}</td>
    </tr>
  `
    )
    .join('');

  const paymentHistoryRows = (data.paymentHistory || [])
    .map(
      (record) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0ebe6;font-size:13px;text-align:center;">${record.date}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0ebe6;font-size:13px;font-weight:600;color:#2e7d32;text-align:center;">₹${record.amount.toLocaleString()}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0ebe6;font-size:13px;text-align:center;">${record.type}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0ebe6;font-size:13px;font-weight:600;color:#d32f2f;text-align:center;">₹${record.remainingAfter.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>पावती - ${data.receiptNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #f6f2ef;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 16px;
          min-height: 100vh;
          margin: 0;
        }

        .receipt {
          max-width: 520px;
          width: 100%;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          position: relative;
        }

        /* Decorative top bar */
        .receipt::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #E65100, #FF8F00, #F57C00);
        }

        .header {
          background: linear-gradient(135deg, #E65100 0%, #F57C00 60%, #FFA726 100%);
          padding: 28px 24px 20px;
          text-align: center;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .header::after {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 50%;
          pointer-events: none;
        }

        .header-logo {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.25);
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(4px);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .header-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .header h1 {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.3px;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.10);
        }

        .header .subtitle {
          font-size: 13px;
          opacity: 0.92;
          margin-top: 2px;
          font-weight: 400;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 1;
        }

        .header .ganpati-bappa {
          font-size: 16px;
          margin-top: 6px;
          font-weight: 600;
          letter-spacing: 0.3px;
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .content {
          padding: 24px 24px 20px;
        }

        .receipt-number {
          text-align: center;
          font-size: 14px;
          background: #fff5f0;
          padding: 10px 12px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid #f0e6e0;
        }

        .receipt-number strong {
          color: #E65100;
          font-weight: 700;
        }

        .section {
          margin-bottom: 18px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #E65100;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #f0e6e0;
        }

        .section-title span {
          background: #fff0e6;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
          color: #b84a1a;
        }

        .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
          border-bottom: 1px dashed #f0ebe6;
        }

        .row:last-child {
          border-bottom: none;
        }

        .row .label {
          color: #6b6b6b;
          font-weight: 500;
        }

        .row .value {
          color: #1a1a1a;
          font-weight: 600;
          text-align: right;
        }

        .row .value.price {
          color: #E65100;
          font-weight: 700;
          font-size: 15px;
        }

        .row .value.amount-paid {
          color: #2e7d32;
        }

        .row .value.amount-remaining {
          color: #d32f2f;
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .payment-table th {
          background: #f8f4f0;
          padding: 8px 6px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #4a4a4a;
          border-bottom: 2px solid #E65100;
        }

        .payment-table td {
          padding: 6px 6px;
          font-size: 13px;
          border-bottom: 1px solid #f0ebe6;
          text-align: center;
        }

        .payment-table tr:last-child td {
          border-bottom: none;
        }

        .contacts-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
        }

        .contacts-table td {
          padding: 4px 0;
          font-size: 13px;
          border-bottom: 1px solid #f0ebe6;
          text-align: center;
        }

        .contacts-table td:last-child {
          font-weight: 500;
          color: #1a1a1a;
        }

        .footer {
          text-align: center;
          padding: 16px 24px;
          background: #faf6f2;
          border-top: 1px solid #f0ebe6;
        }

        .footer .thank-you {
          font-size: 18px;
          font-weight: 700;
          color: #E65100;
        }

        .footer .message {
          font-size: 13px;
          color: #6b6b6b;
          margin-top: 2px;
        }

        .footer .bappa {
          font-size: 16px;
          font-weight: 600;
          color: #b84a1a;
          margin-top: 4px;
        }

        .footer .brand {
          font-size: 12px;
          color: #999;
          margin-top: 6px;
          letter-spacing: 0.3px;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }
          .receipt {
            box-shadow: none;
            border-radius: 0;
            max-width: 100%;
          }
          .receipt::before {
            display: none;
          }
          .payment-table {
            box-shadow: none;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 16px;
          }
          .header {
            padding: 20px 16px 16px;
          }
          .header h1 {
            font-size: 18px;
          }
          .row {
            font-size: 13px;
          }
          .payment-table th,
          .payment-table td {
            font-size: 11px;
            padding: 4px 4px;
          }
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

          <!-- Customer Section -->
          <div class="section">
            <div class="section-title">📋 ग्राहक माहिती <span>${data.customerName}</span></div>
            <div class="row"><span class="label">नाव</span><span class="value">${data.customerName}</span></div>
            <div class="row"><span class="label">मोबाईल</span><span class="value">${data.customerPhone}</span></div>
            ${data.customerEmail ? `<div class="row"><span class="label">ईमेल</span><span class="value">${data.customerEmail}</span></div>` : ''}
            ${data.mandalName ? `<div class="row"><span class="label">मंडळ</span><span class="value">${data.mandalName}</span></div>` : ''}
            ${data.customerAddress ? `<div class="row"><span class="label">पत्ता</span><span class="value">${data.customerAddress}</span></div>` : ''}
          </div>

          <!-- Ganpati Section -->
          <div class="section">
            <div class="section-title">🗿 गणपती माहिती</div>
            <div class="row"><span class="label">नाव</span><span class="value">${data.ganpatiName}</span></div>
            <div class="row"><span class="label">उंची</span><span class="value">${data.ganpatiHeight}</span></div>
            <div class="row"><span class="label">एकूण किंमत</span><span class="value price">₹${data.ganpatiPrice.toLocaleString()}</span></div>
          </div>

          <!-- Payment Summary -->
          <div class="section">
            <div class="section-title">💰 पेमेंट तपशील</div>
            <div class="row"><span class="label">एकूण किंमत</span><span class="value price">₹${data.totalPrice.toLocaleString()}</span></div>
            <div class="row"><span class="label">आतापर्यंत भरले</span><span class="value amount-paid">₹${(data.totalPaidSoFar || 0).toLocaleString()}</span></div>
            <div class="row"><span class="label">बाकी रक्कम</span><span class="value amount-remaining">₹${data.remainingPayment.toLocaleString()}</span></div>
          </div>

          <!-- Payment History (if exists) -->
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

          <!-- Booking Details -->
          <div class="section">
            <div class="section-title">📅 बुकिंग तपशील</div>
            <div class="row"><span class="label">बुकिंग तारीख</span><span class="value">${data.bookingDate}</span></div>
            <div class="row"><span class="label">स्थिती</span><span class="value" style="color: ${data.status === 'COMPLETED' ? '#2e7d32' : '#ed6c02'}; font-weight:700;">${data.status === 'COMPLETED' ? '✅ पूर्ण' : data.status === 'PENDING' ? '⏳ प्रलंबित' : data.status}</span></div>
          </div>

          <!-- Contact Numbers -->
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
          <div class="brand">Siddhivinayak Arts • Kurundwad</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceiptPDF = async (data: ReceiptDataWithHistory): Promise<void> => {
  const element = document.createElement('div');
  element.innerHTML = generateReceiptHTML(data);
  element.style.display = 'flex';
  element.style.justifyContent = 'center';
  element.style.alignItems = 'center';
  element.style.width = '100%';
  element.style.background = '#f6f2ef';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `Receipt-${data.receiptNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 500,
      windowWidth: 500,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: 'avoid-all' as const },
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
  const contactsList = data.contactNumbers
    .map((num, idx) => `${idx + 1}. ${num}`)
    .join('\n');

  const paymentHistoryText = (data.paymentHistory || [])
    .map(
      (record, idx) =>
        `${idx + 1}. ${record.date} - ₹${record.amount.toLocaleString()} (${record.type}) - बाकी: ₹${record.remainingAfter.toLocaleString()}`
    )
    .join('\n');

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