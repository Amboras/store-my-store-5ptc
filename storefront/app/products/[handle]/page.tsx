import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Award,
  Sparkles,
  Package,
  Clipboard,
  Smile,
} from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import ProductAccordion from '@/components/product/product-accordion'
import PurchaseOptions from '@/components/product/purchase-options'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

const BUNDLE_HANDLE = 'the-2-year-starter-kit-2-sets-cleaning-crystals-travel-case'
const PRIMARY_RETAINER_HANDLE = 'custom-clear-retainer-upper-lower-set'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getVariantExtensions(productId: string): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const isPrimaryRetainer = handle === PRIMARY_RETAINER_HANDLE

  const [variantExtensions, bundleProduct] = await Promise.all([
    getVariantExtensions(product.id),
    isPrimaryRetainer ? getProduct(BUNDLE_HANDLE) : Promise.resolve(null),
  ])

  const bundleExtensions = bundleProduct
    ? await getVariantExtensions(bundleProduct.id)
    : {}

  // Build bundle info for the purchase options card
  let bundleInfo: Parameters<typeof PurchaseOptions>[0]['bundle'] = null
  if (bundleProduct && bundleProduct.variants?.[0]) {
    const bv = bundleProduct.variants[0]
    const cp = bv.calculated_price
    const priceCents =
      cp && typeof cp !== 'number' ? cp.calculated_amount ?? 0 : typeof cp === 'number' ? cp : 0
    const currency =
      cp && typeof cp !== 'number' && cp.currency_code ? cp.currency_code : 'usd'
    const ext = bundleExtensions[bv.id]
    bundleInfo = {
      productId: bundleProduct.id,
      productTitle: bundleProduct.title,
      variantId: bv.id,
      priceCents,
      compareAtCents: ext?.compare_at_price ?? null,
      currency,
      inventoryQuantity: ext?.inventory_quantity ?? null,
      allowBackorder: ext?.allow_backorder ?? false,
    }
  }

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: { url: string }) => img.url !== product.thumbnail),
  ]

  const displayImages =
    allImages.length > 0 ? allImages : [{ url: getProductPlaceholder(product.id) }]

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-2xl">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              {/* Badge overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur px-3 py-1 text-xs font-semibold">
                  <Award className="h-3 w-3 text-accent" strokeWidth={2.5} />
                  Zendura® FLX
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold">
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                  Save up to 55%
                </span>
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: { url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden bg-muted rounded-xl"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Social proof strip */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex text-accent">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12 2l2.9 6.9 7.4.6-5.6 4.8 1.7 7.3L12 17.8l-6.4 3.8 1.7-7.3L1.7 9.5l7.4-.6L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9</span>
              <span>· Loved by 12,400+ customers</span>
            </div>

            <div>
              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-h2 font-heading font-semibold leading-tight">
                {product.title}
              </h1>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={product.variants?.[0]?.calculated_price?.currency_code || 'usd'}
              value={product.variants?.[0]?.calculated_price?.calculated_amount ?? null}
            />

            {/* Purchase options — primary retainer uses the CRO-optimized picker */}
            {isPrimaryRetainer ? (
              <PurchaseOptions
                product={product}
                variantExtensions={variantExtensions}
                bundle={bundleInfo}
              />
            ) : (
              <>
                <ProductActions product={product} variantExtensions={variantExtensions} />

                <div className="grid grid-cols-3 gap-4 py-6 border-t">
                  <div className="text-center">
                    <Truck className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground">30-Day Returns</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheck className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground">Secure Checkout</p>
                  </div>
                </div>
              </>
            )}

            {/* Accordion Sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>

      {/* ——— EXTENDED SECTIONS — only on primary retainer ——— */}
      {isPrimaryRetainer && (
        <>
          {/* How it works */}
          <section className="py-16 md:py-20 bg-muted/40 border-t">
            <div className="container-custom">
              <div className="max-w-2xl mx-auto text-center mb-12 space-y-3">
                <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
                  How it works
                </p>
                <h2 className="text-h3 md:text-h2 font-heading font-semibold">
                  From order to perfect fit in under two weeks.
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    n: '01',
                    icon: Package,
                    title: 'Kit arrives',
                    body:
                      'Your free impression kit ships the same day you order. Everything is inside the box.',
                  },
                  {
                    n: '02',
                    icon: Clipboard,
                    title: 'Mold your teeth',
                    body:
                      '10 minutes at your kitchen table. Mail the impressions back — shipping is on us.',
                  },
                  {
                    n: '03',
                    icon: Smile,
                    title: 'Wear your retainer',
                    body:
                      'Hand-crafted by certified technicians and delivered in 10–14 days.',
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="relative rounded-2xl bg-background border border-border p-7"
                  >
                    <div className="absolute top-5 right-5 text-5xl font-heading font-semibold text-muted">
                      {step.n}
                    </div>
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <step.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Guarantee strip */}
          <section className="py-14 border-y">
            <div className="container-custom max-w-3xl text-center space-y-4">
              <ShieldCheck className="h-10 w-10 mx-auto text-accent" strokeWidth={1.5} />
              <h2 className="text-h3 font-heading font-semibold">
                Perfect-fit guarantee or we remake it free.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If your retainer doesn't fit comfortably within 30 days of delivery, we'll
                remake it at no cost. No forms, no fees, no hassle. That's how confident we
                are in our process.
              </p>
            </div>
          </section>
        </>
      )}
    </>
  )
}
