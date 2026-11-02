import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '../../data/store.json');

const prisma = new PrismaClient();

export async function migrateDataToNeon() {
  console.log('🚀 [Migration] Beginning verification & data migration to Neon PostgreSQL...');

  if (!fs.existsSync(STORE_PATH)) {
    throw new Error(`Data store not found at ${STORE_PATH}`);
  }

  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  const store = JSON.parse(raw);

  // 1. Migrate Admin
  if (Array.isArray(store.admins) && store.admins.length > 0) {
    for (const adm of store.admins) {
      await prisma.admin.upsert({
        where: { email: adm.email },
        update: {
          name: adm.name || 'Store Administrator',
          role: adm.role || 'SUPER_ADMIN',
          passwordHash: adm.passwordHash
        },
        create: {
          id: adm.id,
          email: adm.email,
          name: adm.name || 'Store Administrator',
          role: adm.role || 'SUPER_ADMIN',
          passwordHash: adm.passwordHash
        }
      });
    }
    console.log(`✅ [Migration] Admins verified (${store.admins.length})`);
  }

  // 2. Migrate Categories
  if (Array.isArray(store.categories)) {
    for (const cat of store.categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name_en: cat.name_en,
          name_hi: cat.name_hi,
          description_en: cat.description_en || null,
          description_hi: cat.description_hi || null,
          image: cat.image || null,
          bannerImage: cat.bannerImage || null,
          order: cat.order || 0,
          isActive: cat.isActive !== false,
          showInNav: cat.showInNav !== false
        },
        create: {
          id: cat.id,
          slug: cat.slug,
          name_en: cat.name_en,
          name_hi: cat.name_hi,
          description_en: cat.description_en || null,
          description_hi: cat.description_hi || null,
          image: cat.image || null,
          bannerImage: cat.bannerImage || null,
          order: cat.order || 0,
          isActive: cat.isActive !== false,
          showInNav: cat.showInNav !== false
        }
      });

      // Migrate Subcategories if present
      if (Array.isArray(cat.subcategories)) {
        for (const sub of cat.subcategories) {
          await prisma.subcategory.upsert({
            where: { slug: sub.slug },
            update: {
              categoryId: cat.id,
              name_en: sub.name_en,
              name_hi: sub.name_hi,
              description_en: sub.description_en || null,
              description_hi: sub.description_hi || null,
              image: sub.image || null,
              order: sub.order || 0,
              isActive: sub.isActive !== false
            },
            create: {
              id: sub.id,
              categoryId: cat.id,
              slug: sub.slug,
              name_en: sub.name_en,
              name_hi: sub.name_hi,
              description_en: sub.description_en || null,
              description_hi: sub.description_hi || null,
              image: sub.image || null,
              order: sub.order || 0,
              isActive: sub.isActive !== false
            }
          });
        }
      }
    }
    console.log(`✅ [Migration] Categories & Subcategories verified (${store.categories.length})`);
  }

  // 3. Migrate Products
  if (Array.isArray(store.products)) {
    for (const prod of store.products) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          sku: prod.sku,
          title_en: prod.title_en,
          title_hi: prod.title_hi,
          short_description_en: prod.short_description_en || null,
          short_description_hi: prod.short_description_hi || null,
          description_en: prod.description_en,
          description_hi: prod.description_hi,
          features_en: prod.features_en || [],
          features_hi: prod.features_hi || [],
          usage_instructions_en: prod.usage_instructions_en || null,
          usage_instructions_hi: prod.usage_instructions_hi || null,
          specifications: prod.specifications || {},
          price: parseFloat(prod.price),
          compareAtPrice: prod.compareAtPrice ? parseFloat(prod.compareAtPrice) : null,
          stockQuantity: parseInt(prod.stockQuantity || 0, 10),
          categoryId: prod.categoryId,
          subcategoryId: prod.subcategoryId || null,
          brand: prod.brand || 'Mahadev Electro Hub',
          warranty: prod.warranty || null,
          mainImage: prod.mainImage || (prod.images && prod.images[0]) || '/images/logo.png',
          images: prod.images || [],
          shippingInfo: prod.shippingInfo || null,
          returnEligibility: prod.returnEligibility || null,
          status: prod.status || 'ACTIVE',
          featured: !!prod.featured,
          newArrival: !!prod.newArrival,
          bestSeller: !!prod.bestSeller,
          seoTitle_en: prod.seoTitle_en || null,
          seoTitle_hi: prod.seoTitle_hi || null,
          seoDescription_en: prod.seoDescription_en || null,
          seoDescription_hi: prod.seoDescription_hi || null,
        },
        create: {
          id: prod.id,
          slug: prod.slug,
          sku: prod.sku,
          title_en: prod.title_en,
          title_hi: prod.title_hi,
          short_description_en: prod.short_description_en || null,
          short_description_hi: prod.short_description_hi || null,
          description_en: prod.description_en,
          description_hi: prod.description_hi,
          features_en: prod.features_en || [],
          features_hi: prod.features_hi || [],
          usage_instructions_en: prod.usage_instructions_en || null,
          usage_instructions_hi: prod.usage_instructions_hi || null,
          specifications: prod.specifications || {},
          price: parseFloat(prod.price),
          compareAtPrice: prod.compareAtPrice ? parseFloat(prod.compareAtPrice) : null,
          stockQuantity: parseInt(prod.stockQuantity || 0, 10),
          categoryId: prod.categoryId,
          subcategoryId: prod.subcategoryId || null,
          brand: prod.brand || 'Mahadev Electro Hub',
          warranty: prod.warranty || null,
          mainImage: prod.mainImage || (prod.images && prod.images[0]) || '/images/logo.png',
          images: prod.images || [],
          shippingInfo: prod.shippingInfo || null,
          returnEligibility: prod.returnEligibility || null,
          status: prod.status || 'ACTIVE',
          featured: !!prod.featured,
          newArrival: !!prod.newArrival,
          bestSeller: !!prod.bestSeller,
          seoTitle_en: prod.seoTitle_en || null,
          seoTitle_hi: prod.seoTitle_hi || null,
          seoDescription_en: prod.seoDescription_en || null,
          seoDescription_hi: prod.seoDescription_hi || null,
        }
      });
    }
    console.log(`✅ [Migration] Products verified (${store.products.length})`);
  }

  // 4. Migrate Reels
  if (Array.isArray(store.reels)) {
    for (const reel of store.reels) {
      await prisma.reel.upsert({
        where: { id: reel.id },
        update: {
          title: reel.title,
          category: reel.category || null,
          description: reel.description || null,
          sourceType: reel.sourceType || 'url',
          videoUrl: reel.videoUrl,
          thumbnailUrl: reel.thumbnailUrl || null,
          sortOrder: reel.sortOrder || 0,
          isActive: reel.isActive !== false
        },
        create: {
          id: reel.id,
          title: reel.title,
          category: reel.category || null,
          description: reel.description || null,
          sourceType: reel.sourceType || 'url',
          videoUrl: reel.videoUrl,
          thumbnailUrl: reel.thumbnailUrl || null,
          sortOrder: reel.sortOrder || 0,
          isActive: reel.isActive !== false
        }
      });
    }
    console.log(`✅ [Migration] Reels verified (${store.reels.length})`);
  }

  // 5. Migrate Banners
  if (Array.isArray(store.banners)) {
    for (const b of store.banners) {
      await prisma.banner.upsert({
        where: { id: b.id },
        update: {
          title_en: b.title_en || 'Banner',
          title_hi: b.title_hi || 'बैनर',
          subtitle_en: b.subtitle_en || null,
          subtitle_hi: b.subtitle_hi || null,
          image: b.image,
          link: b.link || null,
          ctaText_en: b.ctaText_en || null,
          ctaText_hi: b.ctaText_hi || null,
          order: b.order || 0,
          isActive: b.isActive !== false
        },
        create: {
          id: b.id,
          title_en: b.title_en || 'Banner',
          title_hi: b.title_hi || 'बैनर',
          subtitle_en: b.subtitle_en || null,
          subtitle_hi: b.subtitle_hi || null,
          image: b.image,
          link: b.link || null,
          ctaText_en: b.ctaText_en || null,
          ctaText_hi: b.ctaText_hi || null,
          order: b.order || 0,
          isActive: b.isActive !== false
        }
      });
    }
    console.log(`✅ [Migration] Banners verified (${store.banners.length})`);
  }

  // 6. Migrate Announcement
  if (store.announcement) {
    const ann = store.announcement;
    await prisma.announcement.upsert({
      where: { id: ann.id || 'ann-primary' },
      update: {
        text_en: ann.text_en,
        text_hi: ann.text_hi,
        link: ann.link || null,
        bgColor: ann.bgColor || '#080808',
        textColor: ann.textColor || '#D6A52A',
        isActive: ann.isActive !== false
      },
      create: {
        id: ann.id || 'ann-primary',
        text_en: ann.text_en,
        text_hi: ann.text_hi,
        link: ann.link || null,
        bgColor: ann.bgColor || '#080808',
        textColor: ann.textColor || '#D6A52A',
        isActive: ann.isActive !== false
      }
    });
    console.log('✅ [Migration] Announcement bar verified');
  }

  // 7. Migrate Coupons
  if (Array.isArray(store.coupons)) {
    for (const c of store.coupons) {
      await prisma.coupon.upsert({
        where: { code: c.code },
        update: {
          discountType: c.discountType,
          discountValue: parseFloat(c.discountValue),
          minOrderValue: parseFloat(c.minOrderValue || 0),
          maxDiscount: c.maxDiscount ? parseFloat(c.maxDiscount) : null,
          isActive: c.isActive !== false
        },
        create: {
          id: c.id,
          code: c.code,
          discountType: c.discountType,
          discountValue: parseFloat(c.discountValue),
          minOrderValue: parseFloat(c.minOrderValue || 0),
          maxDiscount: c.maxDiscount ? parseFloat(c.maxDiscount) : null,
          isActive: c.isActive !== false
        }
      });
    }
    console.log(`✅ [Migration] Coupons verified (${store.coupons.length})`);
  }

  // 8. Migrate Orders
  if (Array.isArray(store.orders) && store.orders.length > 0) {
    for (const ord of store.orders) {
      await prisma.order.upsert({
        where: { orderNumber: ord.orderNumber },
        update: {
          customerName: ord.customerName,
          customerPhone: ord.customerPhone,
          customerEmail: ord.customerEmail || null,
          shippingAddress: ord.shippingAddress,
          paymentMethod: ord.paymentMethod || 'ADVANCE_25',
          paymentStatus: ord.paymentStatus || 'PENDING',
          paymentPlan: ord.paymentPlan || null,
          advancePercentage: ord.advancePercentage ? parseFloat(ord.advancePercentage) : null,
          payableNow: ord.payableNow ? parseFloat(ord.payableNow) : null,
          amountPaid: ord.amountPaid ? parseFloat(ord.amountPaid) : 0,
          remainingBalance: ord.remainingBalance ? parseFloat(ord.remainingBalance) : 0,
          advanceTransactionId: ord.advanceTransactionId || null,
          finalTransactionId: ord.finalTransactionId || null,
          balanceReconciledAt: ord.balanceReconciledAt ? new Date(ord.balanceReconciledAt) : null,
          balanceReconciledBy: ord.balanceReconciledBy || null,
          balanceNotes: ord.balanceNotes || null,
          paidAt: ord.paidAt ? new Date(ord.paidAt) : null,
          emailNotificationSent: !!ord.emailNotificationSent,
          emailNotificationSentAt: ord.emailNotificationSentAt ? new Date(ord.emailNotificationSentAt) : null,
          subtotal: parseFloat(ord.subtotal),
          discount: parseFloat(ord.discount || 0),
          shippingFee: parseFloat(ord.shippingFee || 0),
          totalAmount: parseFloat(ord.totalAmount),
          status: ord.status || 'PENDING',
          notes: ord.notes || null,
        },
        create: {
          id: ord.id,
          orderNumber: ord.orderNumber,
          customerName: ord.customerName,
          customerPhone: ord.customerPhone,
          customerEmail: ord.customerEmail || null,
          shippingAddress: ord.shippingAddress,
          paymentMethod: ord.paymentMethod || 'ADVANCE_25',
          paymentStatus: ord.paymentStatus || 'PENDING',
          paymentPlan: ord.paymentPlan || null,
          advancePercentage: ord.advancePercentage ? parseFloat(ord.advancePercentage) : null,
          payableNow: ord.payableNow ? parseFloat(ord.payableNow) : null,
          amountPaid: ord.amountPaid ? parseFloat(ord.amountPaid) : 0,
          remainingBalance: ord.remainingBalance ? parseFloat(ord.remainingBalance) : 0,
          advanceTransactionId: ord.advanceTransactionId || null,
          finalTransactionId: ord.finalTransactionId || null,
          balanceReconciledAt: ord.balanceReconciledAt ? new Date(ord.balanceReconciledAt) : null,
          balanceReconciledBy: ord.balanceReconciledBy || null,
          balanceNotes: ord.balanceNotes || null,
          paidAt: ord.paidAt ? new Date(ord.paidAt) : null,
          emailNotificationSent: !!ord.emailNotificationSent,
          emailNotificationSentAt: ord.emailNotificationSentAt ? new Date(ord.emailNotificationSentAt) : null,
          subtotal: parseFloat(ord.subtotal),
          discount: parseFloat(ord.discount || 0),
          shippingFee: parseFloat(ord.shippingFee || 0),
          totalAmount: parseFloat(ord.totalAmount),
          status: ord.status || 'PENDING',
          notes: ord.notes || null,
        }
      });
    }
    console.log(`✅ [Migration] Orders verified (${store.orders.length})`);
  }

  // 9. Store full sync snapshot in Setting table for instant retrieval & dynamic state
  await prisma.setting.upsert({
    where: { key: 'mahadev_app_store_sync' },
    update: {
      value: JSON.stringify({
        lastSync: new Date().toISOString(),
        settings: store.settings,
        translations: store.translations,
        newArrivalsConfig: store.newArrivalsConfig,
        collectionPromoSlides: store.collectionPromoSlides,
      }),
      updatedAt: new Date()
    },
    create: {
      key: 'mahadev_app_store_sync',
      value: JSON.stringify({
        lastSync: new Date().toISOString(),
        settings: store.settings,
        translations: store.translations,
        newArrivalsConfig: store.newArrivalsConfig,
        collectionPromoSlides: store.collectionPromoSlides,
      }),
      updatedAt: new Date()
    }
  });

  // 10. Perform Verification Read/Write Test
  const testSetting = await prisma.setting.upsert({
    where: { key: 'neon_connection_health_check' },
    update: { value: `OK - ${new Date().toISOString()}` },
    create: { key: 'neon_connection_health_check', value: `OK - ${new Date().toISOString()}` }
  });

  const catCount = await prisma.category.count();
  const prodCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const reelCount = await prisma.reel.count();

  console.log('=======================================================');
  console.log('🎉 NEON POSTGRESQL VERIFICATION & MIGRATION COMPLETE');
  console.log(`📦 Categories in Neon: ${catCount}`);
  console.log(`⚡ Products in Neon: ${prodCount}`);
  console.log(`📋 Orders in Neon: ${orderCount}`);
  console.log(`🎬 Reels in Neon: ${reelCount}`);
  console.log(`🔍 Read/Write Probe: ${testSetting.key} -> ${testSetting.value}`);
  console.log('=======================================================');

  await prisma.$disconnect();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateDataToNeon().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}
