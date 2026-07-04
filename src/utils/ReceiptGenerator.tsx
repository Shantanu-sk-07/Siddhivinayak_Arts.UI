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

const RECEIPT_WIDTH_PX = 470;
const BODY_PADDING_PX = 8; // matches `body { padding: 8px }` below
const CONTAINER_WIDTH_PX = RECEIPT_WIDTH_PX + BODY_PADDING_PX * 2; // 486

export const generateReceiptHTML = (data: ReceiptDataWithHistory): string => {
  const contactsList = data.contactNumbers
    .map(
      (num, idx) => `
    <tr>
      <td style="padding:2px 3px;font-size:8px;text-align:center;">${idx + 1}</td>
      <td style="padding:2px 3px;font-size:8px;text-align:center;font-weight:500;">${num}</td>
    </tr>
  `
    )
    .join('');

  const paymentHistoryRows = (data.paymentHistory || [])
    .map(
      (record) => `
    <tr>
      <td style="padding:2px 3px;font-size:8px;text-align:center;">${record.date}</td>
      <td style="padding:2px 3px;font-size:8px;text-align:center;font-weight:600;color:#2e7d32;">Rs.${record.amount.toLocaleString()}</td>
      <td style="padding:2px 3px;font-size:8px;text-align:center;">${record.type}</td>
      <td style="padding:2px 3px;font-size:8px;text-align:center;font-weight:600;color:#d32f2f;">Rs.${record.remainingAfter.toLocaleString()}</td>
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
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        html, body {
          width: 100%;
        }
        body {
          font-family: 'Noto Sans Devanagari', 'Segoe UI', 'Roboto', Arial, sans-serif;
          background: #f6f2ef;
          margin: 0;
          padding: 8px;
        }
        .receipt-wrapper {
          width: 100%;
          text-align: center;
        }
        .receipt {
          display: inline-block;
          text-align: left;
          width: 470px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          overflow: hidden;
          padding: 10px 14px 8px;
          position: relative;
        }
        .receipt-topbar {
          height: 3px;
          background: linear-gradient(90deg, #E65100, #FF8F00);
          margin: -10px -14px 6px -14px;
          width: calc(100% + 28px);
        }
        .header {
          text-align: center;
          margin-bottom: 4px;
        }
        .header-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #f0e6e0;
          margin: 0 auto 3px;
          overflow: hidden;
          background: white;
          line-height: 0;
        }
        .header-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .header h1 {
          font-size: 12px;
          font-weight: 700;
          color: #E65100;
          letter-spacing: 0.3px;
        }
        .header .subtitle {
          font-size: 8px;
          color: #6b6b6b;
          margin-top: 1px;
        }
        .header .bappa {
          font-size: 10px;
          font-weight: 600;
          color: #b84a1a;
          margin-top: 2px;
        }
        .receipt-number {
          text-align: center;
          font-size: 9px;
          background: #fff5f0;
          padding: 2px 6px;
          border-radius: 10px;
          margin: 4px 0 6px;
          border: 1px solid #f0e6e0;
          width: 100%;
        }
        .receipt-number strong {
          color: #E65100;
          font-weight: 700;
        }
        .section {
          width: 100%;
          margin-bottom: 5px;
        }
        .section-title {
          font-size: 9px;
          font-weight: 700;
          color: #E65100;
          border-bottom: 1px solid #f0e6e0;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .section-title .badge {
          background: #fff0e6;
          padding: 1px 5px;
          border-radius: 8px;
          font-size: 7px;
          color: #b84a1a;
          margin-left: 4px;
          display: inline-block;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-table td {
          padding: 1px 0;
          font-size: 9px;
          border-bottom: 1px solid #f4efeb;
          vertical-align: top;
        }
        .info-table tr:last-child td {
          border-bottom: none;
        }
        .info-table td.label {
          color: #6b6b6b;
          font-weight: 500;
          width: 40%;
          white-space: nowrap;
        }
        .info-table td.value {
          color: #1a1a1a;
          font-weight: 600;
          text-align: right;
          word-break: break-word;
        }
        .info-table td.value.price {
          color: #E65100;
          font-weight: 700;
        }
        .payment-summary {
          width: 100%;
          background: #faf8f6;
          border-radius: 6px;
          border-collapse: collapse;
          margin-bottom: 4px;
        }
        .payment-summary td {
          text-align: center;
          padding: 4px 2px;
          width: 33.33%;
        }
        .payment-summary .label {
          font-size: 7px;
          color: #6b6b6b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .payment-summary .amount {
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
          display: block;
        }
        .payment-summary .amount.total { color: #E65100; }
        .payment-summary .amount.paid { color: #2e7d32; }
        .payment-summary .amount.remaining { color: #d32f2f; }
        .payment-table,
        .contacts-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 2px;
          font-size: 8px;
        }
        .payment-table th {
          background: #f8f4f0;
          padding: 2px 3px;
          text-align: center;
          font-weight: 600;
          color: #4a4a4a;
          border-bottom: 1px solid #E65100;
        }
        .payment-table td {
          padding: 2px 3px;
          border-bottom: 1px solid #f0ebe6;
          text-align: center;
        }
        .payment-table tr:last-child td {
          border-bottom: none;
        }
        .contacts-table td {
          padding: 2px 3px;
          font-size: 8px;
          border-bottom: 1px solid #f0ebe6;
          text-align: center;
        }
        .contacts-table tr:last-child td {
          border-bottom: none;
        }
        .status-completed { color: #2e7d32; font-weight: 700; }
        .status-pending { color: #ed6c02; font-weight: 700; }
        .status-other { color: #1a1a1a; font-weight: 700; }
        .footer {
          text-align: center;
          margin-top: 4px;
          padding-top: 4px;
          border-top: 1px solid #f0e6e0;
        }
        .footer .thank-you {
          font-size: 10px;
          font-weight: 700;
          color: #E65100;
        }
        .footer .message {
          font-size: 8px;
          color: #6b6b6b;
          margin-top: 1px;
        }
        .footer .brand {
          font-size: 7px;
          color: #999;
          margin-top: 2px;
        }
        @media print {
          body { background: white; padding: 0; }
          .receipt {
            box-shadow: none;
            border-radius: 0;
            width: 100%;
            padding: 6px 10px;
          }
          .receipt-topbar { display: none; }
          .payment-summary { background: #f5f5f5; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        <div class="receipt" id="receipt-content">
          <div class="receipt-topbar"></div>

          <div class="header">
            <div class="header-logo"><img src="${LOGO}" alt="Logo" /></div>
            <h1>सिद्धिविनायक आर्ट्स</h1>
            <div class="subtitle">गणपती मूर्ती बुकिंग पावती</div>
            <div class="bappa">गणपती बाप्पा मोरया</div>
          </div>

          <div class="receipt-number"><strong>पावती क्रमांक:</strong> ${data.receiptNumber}</div>

          <div class="section">
            <div class="section-title">ग्राहक माहिती<span class="badge">${data.customerName}</span></div>
            <table class="info-table">
              <tr><td class="label">नाव</td><td class="value">${data.customerName}</td></tr>
              <tr><td class="label">मोबाईल</td><td class="value">${data.customerPhone}</td></tr>
              ${data.customerEmail ? `<tr><td class="label">ईमेल</td><td class="value">${data.customerEmail}</td></tr>` : ''}
              ${data.mandalName ? `<tr><td class="label">मंडळ</td><td class="value">${data.mandalName}</td></tr>` : ''}
              ${data.customerAddress ? `<tr><td class="label">पत्ता</td><td class="value">${data.customerAddress}</td></tr>` : ''}
            </table>
          </div>

          <div class="section">
            <div class="section-title">गणपती माहिती</div>
            <table class="info-table">
              <tr><td class="label">नाव</td><td class="value">${data.ganpatiName}</td></tr>
              <tr><td class="label">उंची</td><td class="value">${data.ganpatiHeight}</td></tr>
              <tr><td class="label">एकूण किंमत</td><td class="value price">Rs.${data.ganpatiPrice.toLocaleString()}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">पेमेंट तपशील</div>
            <table class="payment-summary">
              <tr>
                <td><span class="label">एकूण</span><span class="amount total">Rs.${data.totalPrice.toLocaleString()}</span></td>
                <td><span class="label">भरले</span><span class="amount paid">Rs.${(data.totalPaidSoFar || 0).toLocaleString()}</span></td>
                <td><span class="label">बाकी</span><span class="amount remaining">Rs.${data.remainingPayment.toLocaleString()}</span></td>
              </tr>
            </table>
          </div>

          ${data.paymentHistory && data.paymentHistory.length > 0 ? `
          <div class="section">
            <div class="section-title">पेमेंट हिस्ट्री</div>
            <table class="payment-table">
              <thead><tr><th>तारीख</th><th>रक्कम</th><th>प्रकार</th><th>बाकी</th></tr></thead>
              <tbody>${paymentHistoryRows}</tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">बुकिंग तपशील</div>
            <table class="info-table">
              <tr><td class="label">बुकिंग तारीख</td><td class="value">${data.bookingDate}</td></tr>
              <tr>
                <td class="label">स्थिती</td>
                <td class="value ${data.status === 'COMPLETED' ? 'status-completed' : data.status === 'PENDING' ? 'status-pending' : 'status-other'}">
                  ${data.status === 'COMPLETED' ? 'पूर्ण' : data.status === 'PENDING' ? 'प्रलंबित' : data.status}
                </td>
              </tr>
            </table>
          </div>

          ${data.contactNumbers.length > 0 ? `
          <div class="section">
            <div class="section-title">संपर्क क्रमांक</div>
            <table class="contacts-table">${contactsList}</table>
          </div>
          ` : ''}

          <div class="footer">
            <div class="thank-you">धन्यवाद!</div>
            <div class="message">आपल्या विश्वासाबद्दल हार्दिक आभार</div>
            <div class="brand">सिद्धिविनायक आर्ट्स - कुरुंदवाड, महाराष्ट्र</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const waitForImages = (container: HTMLElement): Promise<void> => {
  const images = Array.from(container.querySelectorAll('img'));
  if (images.length === 0) return Promise.resolve();

  return Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve());
        img.addEventListener('error', () => resolve());
      });
    })
  ).then(() => undefined);
};

export const downloadReceiptPDF = async (data: ReceiptDataWithHistory): Promise<void> => {
  const element = document.createElement('div');
  element.innerHTML = generateReceiptHTML(data);

  element.style.position = 'fixed';
  element.style.top = '0';
  element.style.left = '0';
  element.style.zIndex = '-1';
  element.style.width = `${CONTAINER_WIDTH_PX}px`;
  element.style.background = '#ffffff';
  document.body.appendChild(element);

  try {
    await waitForImages(element);

    const receiptEl = element.querySelector('#receipt-content') as HTMLElement;
    const contentHeightPx = Math.ceil(receiptEl.getBoundingClientRect().height);
    const totalHeightPx = contentHeightPx + BODY_PADDING_PX * 2;

    const PX_TO_MM = 0.264583;
    const pageWidthMm = CONTAINER_WIDTH_PX * PX_TO_MM;
    const pageHeightMm = totalHeightPx * PX_TO_MM;

    const opt = {
      margin: 0,
      filename: `Receipt-${data.receiptNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: CONTAINER_WIDTH_PX,
        height: totalHeightPx,
        windowWidth: CONTAINER_WIDTH_PX,
        windowHeight: totalHeightPx,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: [pageWidthMm, pageHeightMm] as [number, number],
        orientation: 'portrait' as const,
      },
      pagebreak: { mode: ['avoid-all'] as const },
    };

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
        `${idx + 1}. ${record.date} - Rs.${record.amount.toLocaleString()} (${record.type}) - बाकी: Rs.${record.remainingAfter.toLocaleString()}`
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
किंमत: Rs.${data.ganpatiPrice.toLocaleString()}

*💰 पेमेंट तपशील:*
एकूण किंमत: Rs.${data.totalPrice.toLocaleString()}
आतापर्यंत भरले: Rs.${(data.totalPaidSoFar || 0).toLocaleString()}
बाकी रक्कम: Rs.${data.remainingPayment.toLocaleString()}

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