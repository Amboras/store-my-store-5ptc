'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Check, Loader2, ShieldCheck, Star, Lock, Truck, Award, Minus, Plus, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils/format-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import type { VariantExtension } from './product-price'

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}

interface ProductVariantLike {
  id: string
  title?: string
  options?: VariantOption[]
  calculated_price?: { calculated_amount?: number; currency_code?: string } | number
}

interface ProductOptionValue {
  id?: string
  value: string
}

interface ProductOptionLike {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

interface ProductLike {
  id: string
  title: string
  options?: ProductOptionLike[]
  variants?: ProductVariantLike[]
}

interface BundleInfo {
  productId: string
  productTitle: string
  variantId: string
  priceCents: number
  compareAtCents: number | null
  currency: string
  inventoryQuantity: number | null
  allowBackorder: boolean
}

interface PurchaseOptionsProps {
  product: ProductLike
  variantExtensions: Record<string, VariantExtension>
  bundle: BundleInfo | null
}

function getVariantPriceAmount(v?: ProductVariantLike): number | null {
  const cp = v?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

function getVariantCurrency(v?: ProductVariantLike): string {
  const cp = v?.calculated_price
  if (cp && typeof cp !== 'number' && cp.currency_code) return cp.currency_code
  return 'usd'
}

type Plan = 'single' | 'bundle'

export default function PurchaseOptions({
  product,
  variantExtensions,
  bundle,
}: PurchaseOptionsProps) {
  const variants = (product.variants || []) as ProductVariantLike[]
  const options = product.options || []

  const [plan, setPlan] = useState<Plan>('single')
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem, isAddingItem } = useCart()

  // ——— Selected single-variant ———
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    // Default to "Upper + Lower Set" if it exists, otherwise first variant
    const fullSet = variants.find((v) =>
      v.options?.some((o) => o.value === 'Upper + Lower Set'),
    )
    const first = fullSet || variants[0]
    if (first?.options) {
      for (const opt of first.options) {
        const optionId = opt.option_id || opt.option?.id
        if (optionId && opt.value) defaults[optionId] = opt.value
      }
    }
    return defaults
  })

  const selectedVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return (
      variants.find((v) => {
        if (!v.options) return false
        return v.options.every((o) => {
          const optionId = o.option_id || o.option?.id
          if (!optionId) return false
          return selectedOptions[optionId] === o.value
        })
      }) || variants[0]
    )
  }, [variants, selectedOptions])

  const singleExt = selectedVariant?.id ? variantExtensions[selectedVariant.id] : undefined
  const singlePrice = getVariantPriceAmount(selectedVariant)
  const singleCurrency = getVariantCurrency(selectedVariant)
  const singleCompareAt = singleExt?.compare_at_price ?? null
  const singleInventory = singleExt?.inventory_quantity ?? null
  const singleAllowBackorder = singleExt?.allow_backorder ?? false
  const singleOutOfStock =
    !singleAllowBackorder && singleInventory != null && singleInventory <= 0

  const bundleOutOfStock = bundle
    ? !bundle.allowBackorder && bundle.inventoryQuantity != null && bundle.inventoryQuantity <= 0
    : true

  // Pricing for the two plan cards
  const currency = bundle?.currency || singleCurrency

  // For the "single" card, show price of the Full Set variant so both cards are comparable
  const fullSetVariant = variants.find((v) =>
    v.options?.some((o) => o.value === 'Upper + Lower Set'),
  )
  const singleDisplayPrice = getVariantPriceAmount(fullSetVariant) ?? singlePrice ?? 0
  const singleDisplayCompare = fullSetVariant
    ? variantExtensions[fullSetVariant.id]?.compare_at_price ?? null
    : singleCompareAt

  // ——— Urgency: countdown timer & stock ———
  const [secondsLeft, setSecondsLeft] = useState(() => {
    // Count down to midnight (local)
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(23, 59, 59, 999)
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
  })

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  const activeInventory = plan === 'bundle' ? bundle?.inventoryQuantity ?? null : singleInventory
  const isLowStock = activeInventory != null && activeInventory > 0 && activeInventory < 30
  const activeOutOfStock = plan === 'bundle' ? bundleOutOfStock : singleOutOfStock

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (plan === 'single') {
      if (!selectedVariant?.id || singleOutOfStock) return
      addItem(
        { variantId: selectedVariant.id, quantity },
        {
          onSuccess: () => {
            setJustAdded(true)
            toast.success('Added to bag')
            const metaValue = toMetaCurrencyValue(singlePrice)
            trackAddToCart(product.id, selectedVariant.id, quantity, singlePrice ?? undefined)
            trackMetaEvent('AddToCart', {
              content_ids: [selectedVariant.id],
              content_type: 'product',
              content_name: product.title,
              value: metaValue,
              currency: singleCurrency,
              contents: [{ id: selectedVariant.id, quantity, item_price: metaValue }],
              num_items: quantity,
            })
            setTimeout(() => setJustAdded(false), 2000)
          },
          onError: (err: Error) => toast.error(err.message || 'Failed to add to bag'),
        },
      )
      return
    }

    // Bundle plan
    if (!bundle || bundleOutOfStock) return
    addItem(
      { variantId: bundle.variantId, quantity: 1 },
      {
        onSuccess: () => {
          setJustAdded(true)
          toast.success('Added to bag — you saved $219!')
          const metaValue = toMetaCurrencyValue(bundle.priceCents)
          trackAddToCart(bundle.productId, bundle.variantId, 1, bundle.priceCents)
          trackMetaEvent('AddToCart', {
            content_ids: [bundle.variantId],
            content_type: 'product',
            content_name: bundle.productTitle,
            value: metaValue,
            currency: bundle.currency,
            contents: [{ id: bundle.variantId, quantity: 1, item_price: metaValue }],
            num_items: 1,
          })
          setTimeout(() => setJustAdded(false), 2000)
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to add to bag'),
      },
    )
  }

  const hasMultipleVariants = variants.length > 1

  return (
    <div className="space-y-6">
      {/* ——— URGENCY BANNER ——— */}
      <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
        <Clock className="h-4 w-4 flex-shrink-0 text-accent" strokeWidth={2.5} />
        <div className="flex-1 text-sm">
          <span className="font-semibold">Flash sale ends in</span>
          <span className="ml-2 tabular-nums font-mono font-semibold text-accent">
            {hh}:{mm}:{ss}
          </span>
        </div>
      </div>

      {/* ——— PLAN PICKER ——— */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest font-semibold">Choose your plan</p>

        {/* Option A: Single */}
        <button
          type="button"
          onClick={() => setPlan('single')}
          className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
            plan === 'single'
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-foreground/40'
          }`}
        >
          <div className="flex items-start gap-4">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                plan === 'single' ? 'border-accent bg-accent' : 'border-border'
              }`}
            >
              {plan === 'single' && (
                <span className="h-2 w-2 rounded-full bg-background" />
              )}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading font-semibold">1 Retainer Set</h3>
                <div className="flex items-baseline gap-1.5">
                  {singleDisplayCompare && singleDisplayCompare > singleDisplayPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(singleDisplayCompare, currency)}
                    </span>
                  )}
                  <span className="text-lg font-heading font-semibold">
                    {formatPrice(singleDisplayPrice, currency)}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Perfect-fit replacement from Zendura® FLX.
              </p>
            </div>
          </div>
        </button>

        {/* Option B: Bundle */}
        {bundle && (
          <button
            type="button"
            onClick={() => setPlan('bundle')}
            className={`relative w-full text-left rounded-xl border-2 p-5 transition-all ${
              plan === 'bundle'
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-foreground/40'
            }`}
          >
            <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              <Star className="h-3 w-3 fill-current" />
              Most popular · Save $219
            </div>
            <div className="flex items-start gap-4">
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  plan === 'bundle' ? 'border-accent bg-accent' : 'border-border'
                }`}
              >
                {plan === 'bundle' && (
                  <span className="h-2 w-2 rounded-full bg-background" />
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-semibold">2-Year Starter Kit</h3>
                  <div className="flex items-baseline gap-1.5">
                    {bundle.compareAtCents && bundle.compareAtCents > bundle.priceCents && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(bundle.compareAtCents, bundle.currency)}
                      </span>
                    )}
                    <span className="text-lg font-heading font-semibold text-accent">
                      {formatPrice(bundle.priceCents, bundle.currency)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  2 full sets + cleaning crystals + travel case.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-accent font-medium">
                  <span>✓ Backup set included</span>
                  <span>✓ Free travel case</span>
                  <span>✓ 30-day cleaning supply</span>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* ——— ARCH SELECTOR (single plan only) ——— */}
      {plan === 'single' && hasMultipleVariants && options.length > 0 && (
        <div className="space-y-3">
          {options.map((option) => {
            const values = (option.values || [])
              .map((v) => (typeof v === 'string' ? v : v.value))
              .filter(Boolean) as string[]
            if (values.length <= 1 && (values[0] === 'One Size' || values[0] === 'Default'))
              return null
            const optionId = option.id
            const selectedValue = selectedOptions[optionId]
            return (
              <div key={optionId}>
                <h4 className="text-xs uppercase tracking-widest font-semibold mb-3">
                  {option.title}
                  {selectedValue && (
                    <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                      — {selectedValue}
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedValue === value
                    const isAvailable = variants.some((v) => {
                      const hasValue = v.options?.some(
                        (o) =>
                          (o.option_id === optionId || o.option?.id === optionId) &&
                          o.value === value,
                      )
                      if (!hasValue) return false
                      const vExt = variantExtensions[v.id]
                      if (!vExt) return true
                      if (vExt.allow_backorder) return true
                      return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                    })
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleOptionChange(optionId, value)}
                        disabled={!isAvailable}
                        className={`min-w-[48px] px-4 py-2.5 text-sm border transition-all rounded-md ${
                          isSelected
                            ? 'border-foreground bg-foreground text-background'
                            : isAvailable
                              ? 'border-border hover:border-foreground'
                              : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                        }`}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ——— LOW STOCK WARNING ——— */}
      {isLowStock && activeInventory != null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="font-semibold text-red-600">
            Only {activeInventory} left — selling fast
          </span>
        </div>
      )}

      {/* ——— QUANTITY + ADD TO CART ——— */}
      <div className="flex gap-3">
        {plan === 'single' && (
          <div className="flex items-center border rounded-md">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
              disabled={
                singleOutOfStock ||
                (!singleAllowBackorder &&
                  singleInventory != null &&
                  quantity >= singleInventory)
              }
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={activeOutOfStock || isAddingItem}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-4 text-sm font-semibold uppercase tracking-wide transition-all ${
            activeOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : justAdded
                ? 'bg-green-700 text-white'
                : 'bg-foreground text-background hover:opacity-90'
          }`}
        >
          {isAddingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to bag
            </>
          ) : activeOutOfStock ? (
            'Sold Out'
          ) : plan === 'bundle' ? (
            <>Add Kit to Bag · {formatPrice(bundle!.priceCents, bundle!.currency)}</>
          ) : (
            <>
              Add to Bag ·{' '}
              {formatPrice((singlePrice ?? 0) * quantity, singleCurrency)}
            </>
          )}
        </button>
      </div>

      {/* ——— SECURE CHECKOUT STRIP ——— */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" strokeWidth={2} />
        Secure checkout — encrypted with 256-bit SSL
      </div>

      {/* ——— TRUST / GUARANTEE BADGES ——— */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t">
        <div className="text-center space-y-1.5">
          <ShieldCheck className="h-6 w-6 mx-auto text-accent" strokeWidth={1.5} />
          <p className="text-xs font-semibold">Perfect-fit</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Guarantee or we remake free
          </p>
        </div>
        <div className="text-center space-y-1.5">
          <Truck className="h-6 w-6 mx-auto text-accent" strokeWidth={1.5} />
          <p className="text-xs font-semibold">Free shipping</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Both ways · U.S. wide
          </p>
        </div>
        <div className="text-center space-y-1.5">
          <Award className="h-6 w-6 mx-auto text-accent" strokeWidth={1.5} />
          <p className="text-xs font-semibold">FDA-registered</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            U.S. lab · Zendura® FLX
          </p>
        </div>
      </div>
    </div>
  )
}
