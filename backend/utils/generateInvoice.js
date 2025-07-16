const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');


const generateInvoice = async (order) => {
   const sellerId = order.orderItems[0].product.seller._id.toString()// Assuming all items have the same seller
  const seller = await User.findById(sellerId);
  if (!seller) {
   console.error('Seller not found:', sellerId, order.orderItems[0]);
    throw new Error('Seller not found');
  }
   const doc = new PDFDocument({ margin: 50 });
  
  // Create invoice number using timestamp and order number
  const invoiceNumber = `INV-${Date.now()}-${order.orderNumber}`;
  
  // Create absolute path and ensure directory exists
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const invoicesDir = path.join(uploadsDir, 'invoices');
  
  // Create directories if they don't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
  }

  const invoicePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
  console.log('Creating invoice at:', invoicePath);
  
  const writeStream = fs.createWriteStream(invoicePath);
  
  // Handle write stream errors
  writeStream.on('error', (error) => {
    console.error('Error writing invoice:', error);
    throw error;
  });
  
  doc.pipe(writeStream);
  console.log("starting to generate invoice for order:", order.orderNumber);
  // Company Logo and Header
  const logoPath = path.join(__dirname, '..', '..', 'backend', 'public', 'logo.png');
  
  // Add logo if it exists, otherwise skip it
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 50 });
  }
  
  doc.fillColor('#444444')
     .fontSize(20)
     .text('Flipkart', 110, 57)
     .fontSize(10)
     .text('Flipkart Internet Private Limited', 200, 50, { align: 'right' })
     .text('Buildings Alyssa, Begonia &', 200, 65, { align: 'right' })
     .text('Clove Embassy Tech Village,', 200, 80, { align: 'right' })
     .text('Outer Ring Road, Devarabeesanahalli Village,', 200, 95, { align: 'right' })
     .text('Bengaluru, 560103, Karnataka, India', 200, 110, { align: 'right' })
     .text('GSTIN: 29AABCF8078M1ZJ', 200, 125, { align: 'right' })
     .moveDown();

  // Invoice Details
  doc.fontSize(16)
     .text('TAX INVOICE', 50, 160)
     .fontSize(10)
     .text(`Invoice Number: ${invoiceNumber}`, 50, 185)
     .text(`Order Number: ${order.orderNumber}`, 50, 200)
     .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 215)
     .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 230)
     .moveDown();

  // Seller Details
  doc.fontSize(12)
     .text('Seller Details:', 50, 270)
     .fontSize(10)
     .text(`${seller.sellerInfo.businessName}`, 50, 290)
     .text(`GSTIN: ${seller.sellerInfo.gstNumber}`, 50, 305)
     .text(`${seller.sellerInfo.businessAddress }`, 50, 320)
     .text(`Email: ${seller.sellerInfo.businessEmail}`, 50, 335)
     .moveDown();

  // Customer Details
  doc.fontSize(12)
     .text('Shipping Address:', 300, 270)
     .fontSize(10)
     .text(`${order.deliveryAddress.name}`, 300, 290)
     .text(`${order.deliveryAddress.street}`, 300, 305)
     .text(`${order.deliveryAddress.city}, ${order.deliveryAddress.state}`, 300, 320)
     .text(`${order.deliveryAddress.pincode}`, 300, 335)
     .text(`Phone: ${order.deliveryAddress.phone}`, 300, 350)
     .moveDown();

  // Items Table Header
  let y = 400;
  doc.fontSize(10)
     .text('Item', 50, y)
     .text('HSN/SAC', 200, y)
     .text('Qty', 280, y)
     .text('Rate', 330, y)
     .text('Tax', 400, y)
     .text('Amount', 480, y);

  // Items Table Border
  doc.moveTo(50, y + 15)
     .lineTo(530, y + 15)
     .stroke();

  y += 30;

  // Items
  let subtotal = 0;
  let totalTax = 0;

  order.orderItems.forEach(item => {
    doc.text(item.name, 50, y)
       .text('998434', 200, y) // Example HSN code
       .text(item.quantity.toString(), 280, y)
       .text(formatPrice(item.price), 330, y)
       .text(formatPrice(item.price * 0.18), 400, y) // Assuming 18% GST
       .text(formatPrice(item.price * item.quantity), 480, y);

    subtotal += item.price * item.quantity;
    totalTax += item.price * item.quantity * 0.18;

    y += 20;
  });

  // Totals
  y += 20;
  doc.moveTo(50, y)
     .lineTo(530, y)
     .stroke();
  
  y += 20;
  doc.text('Subtotal:', 400, y)
     .text(formatPrice(subtotal), 480, y);
  
  y += 20;
  doc.text('CGST (9%):', 400, y)
     .text(formatPrice(totalTax/2), 480, y);
  
  y += 20;
  doc.text('SGST (9%):', 400, y)
     .text(formatPrice(totalTax/2), 480, y);
  
  y += 20;
  doc.fontSize(12)
     .text('Total:', 400, y)
     .text(formatPrice(subtotal + totalTax), 480, y);

  // Payment Details
  y += 40;
  doc.fontSize(10)
     .text('Payment Information', 50, y)
     .moveDown()
     .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`)
     .text(`Payment Status: ${order.paymentStatus.toUpperCase()}`)
     .moveDown();

  // Terms and Conditions
  doc.fontSize(8)
     .text('Terms and Conditions:', 50, 700)
     .text('1. This is a computer generated invoice and does not require physical signature.')
     .text('2. All disputes are subject to the jurisdiction of courts in Bengaluru, Karnataka.')
     .text('3. E. & O.E.')
     .moveDown();

  // Footer
  doc.fontSize(8)
     .text('For Flipkart Internet Private Limited', 50, 750)
     .text('Authorized Signatory', 50, 765);

  // Finish PDF and return a promise that resolves when the file is written
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log('Invoice generated successfully at:', invoicePath);
      resolve(invoicePath);
    });

    writeStream.on('error', (error) => {
      console.error('Error generating invoice:', error);
      reject(error);
    });

    doc.end();
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

module.exports = generateInvoice;
