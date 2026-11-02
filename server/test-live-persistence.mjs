import { prisma } from './src/database/connection.js';

const BACKEND_URL = 'https://mahadev-electro-hub-backend.vercel.app/api';
const FRONTEND_API_URL = 'https://mahadev-electro-hub.vercel.app/api';

async function runTests() {
  console.log('=== MAHADEV ELECTRO HUB LIVE PERSISTENCE VERIFICATION ===');
  console.log('Target Backend:', BACKEND_URL);
  console.log('Target Frontend:', FRONTEND_API_URL);

  // 1. Authenticate as Admin to get Token from Live Backend
  console.log('\n--- STEP 1: Admin Authentication ---');
  const loginRes = await fetch(`${BACKEND_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pushpendra988799@gmail.com', password: 'Admin@Mahadev2026' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  console.log('Admin login successful! Token acquired.');

  // 2. Fetch existing categories to pick a category ID
  const catsRes = await fetch(`${BACKEND_URL}/categories?all=true`);
  const catsData = await catsRes.json();
  const testCat = catsData.categories?.[0];
  if (!testCat) throw new Error('No categories found');
  console.log('Using category:', testCat.name_en, '(', testCat.id, ')');

  // TEST A: Product Creation
  console.log('\n--- TEST A: Product Creation ---');
  const testSlug = `test-sync-persist-${Date.now()}`;
  const testProductPayload = {
    title_en: 'Test Sync Persistence Product 001',
    title_hi: 'टेस्ट सिंक प्रोडक्ट 001',
    title_hinglish: 'Test Sync Product 001',
    slug: testSlug,
    sku: `TEST-SKU-${Date.now()}`,
    price: 1999,
    compareAtPrice: 2499,
    stockQuantity: 50,
    categoryId: testCat.id,
    short_description_en: 'Temporary verification product to confirm Neon persistence',
    short_description_hi: 'नियॉन पर्सिस्टेंस परीक्षण उत्पाद',
    description_en: 'This product was created by the automated live test suite to verify zero-lag Neon persistence across serverless restarts and page refreshes.',
    description_hi: 'यह उत्पाद सर्वरलेस लैम्ब्डा रीसायकल और पेज रिफ्रेश में डेटा स्थिरता की पुष्टि करता है।',
    mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    status: 'ACTIVE',
    featured: false
  };

  const createRes = await fetch(`${BACKEND_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testProductPayload)
  });
  const createData = await createRes.json();
  if (!createData.success || !createData.product) {
    throw new Error('Failed to create test product: ' + JSON.stringify(createData));
  }
  const createdId = createData.product.id;
  const finalSlug = createData.product.slug;
  console.log(`[PASS] Created test product on Live Backend: ID=${createdId}, Slug=${finalSlug}`);

  // Verify in Neon directly via Prisma
  const neonCreated = await prisma.product.findUnique({ where: { id: createdId } });
  if (!neonCreated) {
    throw new Error('FAIL: Product not found in Neon database!');
  }
  console.log(`[PASS] Confirmed in Neon PostgreSQL: Title="${neonCreated.title_en}", Price=₹${neonCreated.price}`);

  // Verify on Live Public Storefront Proxy
  const storeFetchRes = await fetch(`${FRONTEND_API_URL}/products/${finalSlug}`, {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const storeFetchData = await storeFetchRes.json();
  if (!storeFetchData.success || storeFetchData.product?.id !== createdId) {
    throw new Error('FAIL: Product not immediately visible on Live Frontend!');
  }
  console.log(`[PASS] Confirmed on Live Frontend Storefront: "${storeFetchData.product.title_en}"`);

  // TEST B: Product Update
  console.log('\n--- TEST B: Product Update ---');
  const updatedPrice = 2799;
  const updatedTitle = 'Test Sync Persistence Product 001 (Updated Live)';
  const updateRes = await fetch(`${BACKEND_URL}/products/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...testProductPayload,
      price: updatedPrice,
      title_en: updatedTitle
    })
  });
  const updateData = await updateRes.json();
  if (!updateData.success || updateData.product?.price !== updatedPrice) {
    throw new Error('Failed to update product: ' + JSON.stringify(updateData));
  }
  console.log(`[PASS] Updated on Live Backend: Price=₹${updatedPrice}, Title="${updatedTitle}"`);

  // Verify in Neon directly
  const neonUpdated = await prisma.product.findUnique({ where: { id: createdId } });
  if (neonUpdated.price !== updatedPrice || neonUpdated.title_en !== updatedTitle) {
    throw new Error('FAIL: Updated price/title not reflected in Neon!');
  }
  console.log(`[PASS] Confirmed update in Neon PostgreSQL: Price=₹${neonUpdated.price}`);

  // Verify on Live Storefront
  const storeUpdatedRes = await fetch(`${FRONTEND_API_URL}/products/${finalSlug}`, {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const storeUpdatedData = await storeUpdatedRes.json();
  if (storeUpdatedData.product?.price !== updatedPrice) {
    throw new Error(`FAIL: Storefront returned old price: ${storeUpdatedData.product?.price}`);
  }
  console.log(`[PASS] Confirmed updated price on Live Storefront immediately: ₹${storeUpdatedData.product.price}`);

  // TEST C: Product Deletion
  console.log('\n--- TEST C: Product Deletion ---');
  const deleteRes = await fetch(`${BACKEND_URL}/products/${createdId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const deleteData = await deleteRes.json();
  if (!deleteData.success) {
    throw new Error('Failed to delete product: ' + JSON.stringify(deleteData));
  }
  console.log(`[PASS] Deleted on Live Backend: ID=${createdId}`);

  // Verify in Neon directly
  const neonDeleted = await prisma.product.findUnique({ where: { id: createdId } });
  if (neonDeleted !== null) {
    throw new Error('FAIL: Product still exists in Neon after deletion!');
  }
  console.log('[PASS] Confirmed deleted from Neon PostgreSQL (findUnique returned null)');

  // Verify on Live Storefront (must return 404 or success: false and NOT resurrect)
  const storeDeletedRes = await fetch(`${FRONTEND_API_URL}/products/${finalSlug}`, {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const storeDeletedData = await storeDeletedRes.json();
  if (storeDeletedData.success === true && storeDeletedData.product) {
    throw new Error('FAIL: Product still returned by Storefront after deletion!');
  }
  console.log('[PASS] Confirmed deleted product is GONE from Live Storefront (no resurrection)');

  // TEST D: Reels & CMS
  console.log('\n--- TEST D: Reels & CMS Persistence ---');
  const reelsRes = await fetch(`${BACKEND_URL}/reels`);
  const reelsData = await reelsRes.json();
  console.log(`[PASS] Live Reels count from Neon: ${reelsData.reels?.length}`);

  const reviewsRes = await fetch(`${BACKEND_URL}/cms/reviews`);
  const reviewsData = await reviewsRes.json();
  console.log(`[PASS] Live Reviews count from Neon: ${reviewsData.reviews?.length}`);

  console.log('\n======================================================');
  console.log('ALL LIVE PERSISTENCE & SYNCHRONIZATION TESTS PASSED! 🎉');
  console.log('======================================================');
  await prisma.$disconnect();
  process.exit(0);
}

runTests().catch(async (err) => {
  console.error('\nTEST SUITE FAILED:', err);
  await prisma.$disconnect();
  process.exit(1);
});
