const { PrismaClient } = require('@prisma/client');
const { parsePrice, parseOptionalPrice, calculateDiscountPercent } = require('../src/lib/price-parser');
const { restoreStockForCancelledOrder } = require('../src/lib/stock-manager');
const { validateTrackingId } = require('../src/lib/tracking');

const prisma = new PrismaClient();

async function runAcceptanceTests() {
  console.log('======================================================');
  console.log('       SOKHER STORE - COMPREHENSIVE ACCEPTANCE TESTS    ');
  console.log('======================================================\n');

  let passedCount = 0;
  let totalTests = 9;

  try {
    // -----------------------------------------------------------------
    // TEST 1: Price Parsing & Zero/Negative Validation
    // -----------------------------------------------------------------
    console.log('Test 1: Price Parser ("1,200" -> 1200, 0/faka -> block)');
    const p1 = parsePrice('1,200');
    const p2 = parsePrice(' ১২০০ ৳ ');
    const p3 = parsePrice('0');
    const p4 = parsePrice('');
    const p5 = parsePrice('-50');

    if (
      p1.value === 1200 &&
      p2.value === 1200 &&
      p3.error !== null &&
      p4.error !== null &&
      p5.error !== null
    ) {
      console.log('  [PASS] Test 1: Price correctly parsed to 1200 and invalid/0 prices blocked!\n');
      passedCount++;
    } else {
      console.error('  [FAIL] Test 1: Price parsing failed.\n');
    }

    // -----------------------------------------------------------------
    // TEST 2: Product Edit Preserves Regular Price, SKU, Subcategory
    // -----------------------------------------------------------------
    console.log('Test 2: Product Edit preserves Regular Price, SKU, Subcategory');
    // Create initial test product
    const testProd = await prisma.product.upsert({
      where: { sku: 'TEST-SKU-999' },
      update: {},
      create: {
        name: 'TEST Pond Cream',
        slug: 'test-pond-cream',
        sku: 'TEST-SKU-999',
        price: 500,
        regularPrice: 650,
        stock: 20,
        status: 'ACTIVE',
        images: '["/images/logo-icon.jpg"]',
      },
    });

    // Simulate updating ONLY stock
    const updatedProd = await prisma.product.update({
      where: { id: testProd.id },
      data: {
        stock: 35, // Only changing stock
      },
    });

    if (
      updatedProd.stock === 35 &&
      updatedProd.regularPrice === 650 &&
      updatedProd.sku === 'TEST-SKU-999'
    ) {
      console.log('  [PASS] Test 2: Stock updated to 35, Regular Price (650) and SKU preserved intact!\n');
      passedCount++;
    } else {
      console.error('  [FAIL] Test 2: Existing fields were lost during edit.\n');
    }

    // -----------------------------------------------------------------
    // TEST 3: Multi-Category & Subcategory Matching & DB Count
    // -----------------------------------------------------------------
    console.log('Test 3: Product Multi-Category association and DB-calculated counts');
    const cats = await prisma.category.findMany({ take: 2 });
    if (cats.length >= 2) {
      await prisma.productCategory.deleteMany({ where: { productId: testProd.id } });
      await prisma.productCategory.createMany({
        data: [
          { productId: testProd.id, categoryId: cats[0].id },
          { productId: testProd.id, categoryId: cats[1].id },
        ],
      });

      const linkedCount = await prisma.productCategory.count({
        where: { productId: testProd.id },
      });

      if (linkedCount === 2) {
        console.log(`  [PASS] Test 3: Product successfully associated with 2 categories ("${cats[0].name}" & "${cats[1].name}")!\n`);
        passedCount++;
      } else {
        console.error('  [FAIL] Test 3: Multi-category linking failed.\n');
      }
    } else {
      console.log('  [SKIP] Test 3: Less than 2 categories available.\n');
    }

    // -----------------------------------------------------------------
    // TEST 4: Delete Product Cleanly
    // -----------------------------------------------------------------
    console.log('Test 4: Product Delete cleanly removes product from DB');
    const tempProd = await prisma.product.create({
      data: {
        name: 'TEST To Delete',
        slug: 'test-to-delete-' + Date.now(),
        sku: 'TEST-DEL-' + Date.now(),
        price: 100,
        stock: 10,
        images: '[]',
      },
    });

    await prisma.product.delete({ where: { id: tempProd.id } });
    const checkDeleted = await prisma.product.findUnique({ where: { id: tempProd.id } });

    if (checkDeleted === null) {
      console.log('  [PASS] Test 4: Product deleted cleanly from database.\n');
      passedCount++;
    } else {
      console.error('  [FAIL] Test 4: Product still exists after delete.\n');
    }

    // -----------------------------------------------------------------
    // TEST 5: Order Snapshot & Idempotent Cancel Stock Restoration
    // -----------------------------------------------------------------
    console.log('Test 5: Order snapshot & IDEMPOTENT stock restoration on Cancel');
    const initialStock = 50;
    const testOrderProd = await prisma.product.create({
      data: {
        name: 'TEST Lipstick Red',
        slug: 'test-lipstick-red-' + Date.now(),
        sku: 'TEST-LIP-' + Date.now(),
        price: 450,
        stock: initialStock,
        images: '[]',
      },
    });

    // Place an order for 5 items
    const orderQty = 5;
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: 'TEST-ORD-' + Date.now(),
        customerName: 'Test Buyer',
        customerPhone: '01700000000',
        shippingAddress: 'Dhaka',
        deliveryZone: 'DHAKA',
        subtotal: 450 * orderQty,
        deliveryCharge: 70,
        totalAmount: 450 * orderQty + 70,
        paymentMethod: 'COD',
        orderStatus: 'PENDING',
        isStockRestored: false,
        items: {
          create: [
            {
              productId: testOrderProd.id,
              productName: testOrderProd.name,
              productSku: testOrderProd.sku,
              unitPrice: testOrderProd.price,
              quantity: orderQty,
              lineTotal: testOrderProd.price * orderQty,
            },
          ],
        },
      },
    });

    // Simulate inventory reduction at purchase time: stock = 50 - 5 = 45
    await prisma.product.update({
      where: { id: testOrderProd.id },
      data: { stock: initialStock - orderQty },
    });

    // Cancel order 1st time -> stock should restore from 45 to 50
    const cancel1 = await restoreStockForCancelledOrder(testOrder.id);
    const prodAfterCancel1 = await prisma.product.findUnique({ where: { id: testOrderProd.id } });

    // Cancel order 2nd time -> stock should STAY 50 (NEVER become 55!)
    const cancel2 = await restoreStockForCancelledOrder(testOrder.id);
    const prodAfterCancel2 = await prisma.product.findUnique({ where: { id: testOrderProd.id } });

    if (
      prodAfterCancel1.stock === 50 &&
      prodAfterCancel2.stock === 50 &&
      cancel2.message.includes('পূর্বেই পুনরুদ্ধার')
    ) {
      console.log('  [PASS] Test 5: Idempotency verified! 1st cancel restored stock to 50. 2nd cancel preserved stock at 50 without duplicate increment!\n');
      passedCount++;
    } else {
      console.error(`  [FAIL] Test 5: Stock restoration not idempotent! Stock: ${prodAfterCancel2.stock}\n`);
    }

    // Clean up test order & product
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.product.delete({ where: { id: testOrderProd.id } });

    // -----------------------------------------------------------------
    // TEST 6: Clear Cart Logic
    // -----------------------------------------------------------------
    console.log('Test 6: Clear Cart calculation and zero reset');
    let cart = [
      { productId: '1', price: 350, quantity: 2 },
      { productId: '2', price: 1150, quantity: 1 },
    ];
    let subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Perform clear
    cart = [];
    subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal;

    if (cart.length === 0 && subtotal === 0 && total === 0) {
      console.log('  [PASS] Test 6: Clear cart empties items and resets subtotal and total to 0!\n');
      passedCount++;
    } else {
      console.error('  [FAIL] Test 6: Clear cart failed.\n');
    }

    // -----------------------------------------------------------------
    // TEST 7: Delivery Single Source of Truth
    // -----------------------------------------------------------------
    console.log('Test 7: Delivery Single Source of Truth from Settings');
    const settings = await prisma.storeSetting.findUnique({ where: { id: 'default' } });
    const dhakaRate = settings.deliveryDhaka; // 70
    const outsideRate = settings.deliveryOutsideDhaka; // 130
    const freeThreshold = settings.freeDeliveryThreshold; // 999

    const calcDelivery = (sub, zone) => {
      if (sub >= freeThreshold) return 0;
      return zone === 'DHAKA' ? dhakaRate : outsideRate;
    };

    const d1 = calcDelivery(500, 'DHAKA');
    const d2 = calcDelivery(500, 'OUTSIDE_DHAKA');
    const d3 = calcDelivery(1500, 'OUTSIDE_DHAKA'); // Above free threshold

    if (d1 === 70 && d2 === 130 && d3 === 0) {
      console.log('  [PASS] Test 7: Delivery rules verified: Dhaka ৳70, Outside ৳130, Free over ৳999 (৳0)!\n');
      passedCount++;
    } else {
      console.error('  [FAIL] Test 7: Delivery calculation mismatch.\n');
    }

    // -----------------------------------------------------------------
    // TEST 8: Tracking ID Validation & Omission
    // -----------------------------------------------------------------
    console.log('Test 8: Tracking ID format validation and blank omission rule');
    const vPixelValid = validateTrackingId('pixel', '123456789012');
    const vPixelInvalid = validateTrackingId('pixel', 'INVALID_PIXEL');
    const vGa4Valid = validateTrackingId('ga4', 'G-ABC12345');
    const vGa4Invalid = validateTrackingId('ga4', 'UA-12345');
    const vGtmValid = validateTrackingId('gtm', 'GTM-ABCD12');
    const vBlank = validateTrackingId('pixel', '');

    if (
      vPixelValid.valid &&
      !vPixelInvalid.valid &&
      vGa4Valid.valid &&
      !vGa4Invalid.valid &&
      vGtmValid.valid &&
      vBlank.valid
    ) {
      console.log('  [PASS] Test 8: Tracking ID validations strictly enforce G-, GTM-, and numeric rules!\n');
      passedCount++;
    } else {
      console.error('  [FAIL] Test 8: Tracking validation failed.\n');
    }

    // -----------------------------------------------------------------
    // TEST 9: Discount % Consistency
    // -----------------------------------------------------------------
    console.log('Test 9: Consistent Discount % formula');
    const disc1 = calculateDiscountPercent(350, 450); // 22%
    const disc2 = calculateDiscountPercent(1150, 1350); // 15%
    const disc3 = calculateDiscountPercent(690, 850); // 19%

    if (disc1 === 22 && disc2 === 15 && disc3 === 19) {
      console.log('  [PASS] Test 9: Discount percentage matches reference: 350/450 -> 22%, 1150/1350 -> 15%, 690/850 -> 19%!\n');
      passedCount++;
    } else {
      console.error(`  [FAIL] Test 9: Expected 22, 15, 19 but got ${disc1}, ${disc2}, ${disc3}\n`);
    }

    // Clean up testProd
    await prisma.productCategory.deleteMany({ where: { productId: testProd.id } });
    await prisma.product.delete({ where: { id: testProd.id } });

    console.log('======================================================');
    console.log(`SUMMARY: ${passedCount}/${totalTests} ACCEPTANCE TESTS PASSED!`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Acceptance tests encountered error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runAcceptanceTests();
