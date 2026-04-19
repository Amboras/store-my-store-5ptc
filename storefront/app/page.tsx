'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Package,
  Clipboard,
  Smile,
  Award,
  CheckCircle2,
  DollarSign,
  Clock,
} from 'lucide-react'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1559591935-c6c92c6cbe9a?auto=format&fit=crop&w=1600&q=80'
const LIFESTYLE_IMAGE =
  'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=80'
const PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1600&q=80'
const KIT_IMAGE =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1600&q=80'

export default function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'newsletter_signup',
      status: 'submitted',
    })
  }

  return (
    <>
      {/* ——————————————————————————— HERO ——————————————————————————— */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/60 via-background to-background">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 left-1/4 h-[420px] w-[420px] rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-foreground/10 blur-3xl" />
        </div>

        <div className="container-custom grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center py-16 lg:py-28">
          {/* Copy */}
          <div className="space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Made in FDA-registered U.S. labs
            </div>

            <h1 className="text-display font-heading font-semibold text-balance leading-[1.05]">
              Custom retainers,
              <br />
              <span className="text-accent">half the dentist price.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Replace your lost or worn-out retainer without another trip to the orthodontist.
              Take your impression at home — we'll craft a perfect-fit retainer from{' '}
              <span className="font-semibold text-foreground">Zendura® FLX</span>, the same
              orthodontist-grade material your dentist uses.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/products/custom-clear-retainer-upper-lower-set"
                className="btn-brand-primary inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wide transition-opacity"
                prefetch={true}
              >
                Start My Retainer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-4 text-sm font-semibold uppercase tracking-wide hover:border-foreground transition-colors"
              >
                How It Works
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                Perfect-fit guarantee
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" strokeWidth={2} />
                Free shipping both ways
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" strokeWidth={2} />
                Zendura® FLX material
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-[4/5] bg-muted rounded-3xl overflow-hidden">
              <Image
                src={HERO_IMAGE}
                alt="Confident smile with clear retainer"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Floating badge — savings */}
            <div className="absolute -bottom-6 -left-6 hidden sm:flex flex-col rounded-2xl bg-background border border-border shadow-xl p-5 w-56">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Average savings
              </div>
              <div className="mt-1 text-4xl font-heading font-semibold">$400+</div>
              <div className="text-xs text-muted-foreground mt-1">
                vs. replacing at the dentist
              </div>
            </div>

            {/* Floating badge — material */}
            <div className="absolute -top-4 -right-3 hidden md:flex items-center gap-3 rounded-full bg-foreground text-primary-foreground px-4 py-2.5 shadow-lg">
              <Award className="h-4 w-4 text-accent" strokeWidth={2.5} />
              <span className="text-xs font-semibold tracking-wide">Zendura® FLX</span>
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————————————————— STATS STRIP ——————————————————————————— */}
      <section className="border-y bg-muted/40">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { stat: '50,000+', label: 'Smiles protected' },
            { stat: '4.9★', label: 'Avg. customer rating' },
            { stat: '10 min', label: 'At-home impression' },
            { stat: '50%+', label: 'Off dentist pricing' },
          ].map((item) => (
            <div key={item.label} className="py-8 px-4 text-center">
              <div className="text-2xl md:text-3xl font-heading font-semibold">
                {item.stat}
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ——————————————————————————— HOW IT WORKS ——————————————————————————— */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
              How It Works
            </p>
            <h2 className="text-h2 font-heading font-semibold">
              Your retainer, delivered in three simple steps.
            </h2>
            <p className="text-muted-foreground">
              No dentist appointment. No hidden fees. Just a perfect-fit retainer shipped to
              your door in under two weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: '01',
                icon: Package,
                title: 'Order your kit',
                body:
                  'Your free at-home impression kit ships within 24 hours. Everything you need is in the box.',
              },
              {
                n: '02',
                icon: Clipboard,
                title: 'Take your impression',
                body:
                  '10 minutes at your kitchen table. Follow the guided instructions and mail it back — shipping is on us.',
              },
              {
                n: '03',
                icon: Smile,
                title: 'Wear your retainer',
                body:
                  'Custom-crafted in our U.S. lab and delivered to your door in 10–14 days. Perfect fit guaranteed.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="relative rounded-2xl border border-border bg-background p-8 hover:border-foreground/30 transition-colors"
              >
                <div className="absolute top-6 right-6 text-6xl font-heading font-semibold text-muted">
                  {step.n}
                </div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <step.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——————————————————————————— PRODUCT SHOWCASE ——————————————————————————— */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container-custom">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
                Shop
              </p>
              <h2 className="text-h2 font-heading font-semibold mt-2">
                Pick the plan that fits your smile.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide link-underline pb-1"
              prefetch={true}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Single Retainer Card */}
            <Link
              href="/products/custom-clear-retainer-upper-lower-set"
              className="group rounded-2xl bg-background border border-border overflow-hidden hover:border-foreground/40 transition-all hover:shadow-xl"
              prefetch={true}
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <Image
                  src={PRODUCT_IMAGE}
                  alt="Custom Clear Retainer"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 rounded-full bg-background/95 backdrop-blur px-3 py-1 text-xs font-semibold tracking-wide">
                  Best for quick replacement
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-xl font-heading font-semibold">
                  Custom Clear Retainer
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  A single perfect-fit retainer, custom-molded from your at-home impression.
                  Choose upper, lower, or a complete set.
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <span className="text-2xl font-heading font-semibold">From $69</span>
                  <span className="text-sm text-muted-foreground line-through">$149</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Shop
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>

            {/* 2-Year Kit Card */}
            <Link
              href="/products/the-2-year-starter-kit-2-sets-cleaning-crystals-travel-case"
              className="group relative rounded-2xl bg-foreground text-primary-foreground overflow-hidden hover:shadow-2xl transition-all"
              prefetch={true}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={KIT_IMAGE}
                  alt="2-Year Starter Kit"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute top-4 left-4 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold tracking-wide">
                  ★ Most popular · Save $219
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-xl font-heading font-semibold">
                  The 2-Year Starter Kit
                </h3>
                <p className="text-sm text-white/70 mt-2 leading-relaxed">
                  Two full sets, a month of cleaning crystals, and a premium travel case.
                  Everything you need for two worry-free years.
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <span className="text-2xl font-heading font-semibold">$179</span>
                  <span className="text-sm text-white/50 line-through">$398</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Shop
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ——————————————————————————— COMPARISON ——————————————————————————— */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
              Why AlignFit
            </p>
            <h2 className="text-h2 font-heading font-semibold">
              The same retainer. Half the price. Delivered to your door.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* AlignFit column */}
            <div className="rounded-2xl border-2 border-accent bg-accent/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-heading font-semibold">AlignFit</h3>
              </div>
              <ul className="space-y-4 text-sm">
                {[
                  'From $69 per retainer — direct-to-you pricing',
                  'Ships in 10–14 days, no appointment needed',
                  'Zendura® FLX — orthodontist-grade material',
                  'Free at-home impression kit & return shipping',
                  'Perfect-fit guarantee or we remake it free',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0 text-accent"
                      strokeWidth={2}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dentist column */}
            <div className="rounded-2xl border border-border bg-muted/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-muted-foreground">
                  At the dentist
                </h3>
              </div>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {[
                  '$300–$600+ per retainer',
                  'Office visit required, 2–4 weeks turnaround',
                  'Material quality varies by lab',
                  'No included shipping or cleaning supplies',
                  'Usually no refit guarantee',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————————————————— EDITORIAL ——————————————————————————— */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] bg-muted rounded-2xl overflow-hidden">
              <Image
                src={LIFESTYLE_IMAGE}
                alt="Confident smile"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 lg:max-w-md">
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
                Built for your smile
              </p>
              <h2 className="text-h2 font-heading font-semibold">
                Engineered in the U.S. Crafted for you.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Every AlignFit retainer is hand-finished in an FDA-registered lab by
                certified dental technicians. We use Zendura® FLX — the clearest,
                crack-resistant, BPA-free thermoplastic trusted by top orthodontists
                worldwide. The result: a retainer that's virtually invisible, impossibly
                comfortable, and built to last.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide link-underline pb-0.5"
                prefetch={true}
              >
                Our process
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————————————————— TRUST BAR ——————————————————————————— */}
      <section className="py-12 border-y">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Truck, title: 'Free shipping', sub: 'Both ways, every order' },
            { icon: ShieldCheck, title: 'Perfect-fit guarantee', sub: "We'll remake it free" },
            { icon: Award, title: 'U.S. lab-crafted', sub: 'FDA-registered facility' },
            { icon: Sparkles, title: 'Zendura® FLX', sub: 'Orthodontist-grade' },
          ].map((t) => (
            <div key={t.title} className="flex flex-col items-center gap-2">
              <t.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <div className="text-sm font-semibold">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ——————————————————————————— NEWSLETTER ——————————————————————————— */}
      <section className="py-20 md:py-28">
        <div className="container-custom max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
            Stay in the know
          </p>
          <h2 className="mt-3 text-h2 font-heading font-semibold">
            Smile tips, straight to your inbox.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Retainer care guides, new drops, and the occasional exclusive discount.
          </p>
          <form
            className="mt-8 flex gap-2 rounded-full border border-border bg-background p-1.5 shadow-sm"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="btn-brand-primary rounded-full px-6 py-2.5 text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
