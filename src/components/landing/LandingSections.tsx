import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Mail, Menu, QrCode, ScanLine, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaproLogo from '../branding/TaproLogo';
import { Button, Card, Input, Textarea, classNames } from '../ui';
import { faqs, features, howItWorksSteps, landingNavItems, logoCloud, pricingPlans, productPreviews, qrDemoSteps, testimonials } from '../../data/landingContent';

const scrollToSection = (href: string) => {
  const target = document.querySelector(href);
  target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
};

export const LandingHeader = () => {
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      {landingNavItems.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => {
            scrollToSection(item.href);
            setOpen(false);
          }}
          className="min-h-11 rounded-xl px-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
        >
          {item.label}
        </button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Tapro home" className="flex min-w-0 items-center gap-3">
          <TaproLogo size="sm" className="max-w-[150px]" />
        </Link>
        <nav aria-label="Landing page navigation" className="hidden items-center gap-1 lg:flex">
          {nav}
        </nav>
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link to="/login" className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-slate-700 hover:bg-slate-100">Login</Link>
          <Link to="/register" className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">Start Free</Link>
        </div>
        <button
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="landing-mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>
      <div id="landing-mobile-navigation" className={classNames('border-t border-slate-200 px-4 py-3 lg:hidden', open ? 'grid gap-1' : 'hidden')}>
        {nav}
        <div className="mt-2 grid gap-2">
          <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700">Login</Link>
          <Link to="/register" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">Start Free</Link>
        </div>
      </div>
    </header>
  );
};

const InterfacePreview = () => (
  <div className="relative mx-auto w-full max-w-xl rounded-[2rem] border border-white/20 bg-white/12 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur">
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Live orders</p>
          <p className="mt-1 text-lg font-semibold">Dinner service</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">12 active</span>
      </div>
      <div className="mt-4 grid gap-3">
        {['Table 4 - Preparing', 'Table 8 - Ready', 'Table 2 - Pending'].map((label, index) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="min-w-0">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-slate-500">{index + 2} items</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const HeroSection = () => (
  <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_100%)]">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-center lg:px-8">
      <div className="min-w-0">
        <p className="inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Restaurant QR ordering SaaS</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,11vw,5rem)] font-semibold leading-[0.95] tracking-tight text-slate-950">
          Turn every table into a smarter ordering experience.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          Tapro helps restaurant owners launch QR table ordering, manage digital menus, process orders, and keep staff aligned from one secure workspace.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/register" className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
            Start Free <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
          </Link>
          <button type="button" onClick={() => scrollToSection('#qr-demo')} className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            See QR Demo
          </button>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-slate-600 min-[520px]:grid-cols-3">
          {['No app install for guests', 'Table-specific ordering', 'Role-aware staff views'].map((item) => (
            <div key={item} className="flex items-center gap-2"><Check aria-hidden className="h-4 w-4 text-emerald-600" />{item}</div>
          ))}
        </div>
      </div>
      <div className="rounded-[2rem] bg-[#063f43] p-4 sm:p-6">
        <InterfacePreview />
      </div>
    </div>
  </section>
);

export const ProductShowcase = () => (
  <section id="product" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Product showcase</p>
      <h2 className="mt-3 text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight text-slate-950">A Tapro workspace for every service role.</h2>
    </div>
    <div className="mt-8 grid gap-5 lg:grid-cols-3">
      {productPreviews.map((preview, index) => (
        <Card key={preview.title} className="p-0">
          <div className="aspect-[4/3] bg-slate-950 p-4 text-white">
            <div className="rounded-2xl bg-white p-3 text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{preview.eyebrow}</p>
              <div className="mt-4 grid gap-2">
                {Array.from({ length: 4 }).map((_, row) => (
                  <div key={row} className="flex items-center justify-between rounded-xl bg-slate-100 p-3">
                    <span className="h-3 w-24 rounded-full bg-slate-300" />
                    <span className={classNames('h-6 rounded-full px-5', row === index ? 'bg-emerald-500' : 'bg-slate-300')} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold">{preview.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{preview.description}</p>
          </div>
        </Card>
      ))}
    </div>
  </section>
);

export const QRDemo = () => {
  const [step, setStep] = useState(0);
  const prefersReduced = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, []);

  useEffect(() => {
    if (prefersReduced) return;
    const id = window.setInterval(() => setStep((value) => (value + 1) % qrDemoSteps.length), 2200);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  return (
    <section id="qr-demo" className="bg-slate-950 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Animated QR demo</p>
          <h2 className="mt-3 text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight">From table scan to kitchen queue.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">This visual demonstrates the Tapro ordering flow. It does not claim live camera scanning on this landing page.</p>
          <div className="mt-6 grid gap-2">
            {qrDemoSteps.map((item, index) => (
              <button key={item} type="button" onClick={() => setStep(index)} aria-pressed={step === index} className={classNames('min-h-11 rounded-xl px-4 text-left text-sm transition', step === index ? 'bg-emerald-500 text-white' : 'bg-white/8 text-slate-300 hover:bg-white/12')}>
                {index + 1}. {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="rounded-[2rem] border border-white/12 bg-white/8 p-5 text-center">
            <QrCode aria-hidden className="mx-auto h-32 w-32 text-white" />
            <div className={classNames('mx-auto mt-4 h-1 w-32 rounded-full bg-emerald-300', !prefersReduced && 'animate-pulse')} />
            <p className="mt-4 text-sm text-slate-300">Table QR card</p>
          </div>
          <div className="rounded-[2rem] border border-white/12 bg-white p-4 text-slate-950">
            <div className="mx-auto max-w-[260px] rounded-[2rem] border-8 border-slate-900 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><ScanLine aria-hidden className="h-4 w-4" />{qrDemoSteps[step]}</div>
              <div className="mt-5 space-y-3">
                {['Crispy rice bowl', 'Fresh lime soda', 'Spiced fries'].map((item, index) => (
                  <div key={item} className={classNames('rounded-2xl border p-3 transition', index <= step % 3 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white')}>
                    <p className="font-medium">{item}</p>
                    <p className="text-xs text-slate-500">{index === 0 ? 'Popular item' : 'Ready to add'}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">Place order</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HowItWorks = () => (
  <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <h2 className="text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight text-slate-950">How Tapro works</h2>
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {howItWorksSteps.map((item, index) => (
        <Card key={item.title}>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white">{index + 1}</div>
          <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        </Card>
      ))}
    </div>
  </section>
);

export const FeatureGrid = () => (
  <section id="features" className="bg-slate-50 py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight text-slate-950">Built for real restaurant workflows.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 [&>svg]:h-5 [&>svg]:w-5">{feature.icon}</div>
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export const PricingSection = () => (
  <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <h2 className="text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight text-slate-950">Pricing that can scale with service.</h2>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Live billing is not exposed on this landing page. Plans are presented as contact-sales tiers until backend subscription data is connected.</p>
    <div className="mt-8 grid gap-5 lg:grid-cols-3">
      {pricingPlans.map((plan) => (
        <Card key={plan.name} className={classNames('relative', plan.recommended && 'border-emerald-500 shadow-lg')}>
          {plan.recommended ? <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Recommended</span> : null}
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{plan.audience}</p>
          <p className="mt-6 text-3xl font-semibold">{plan.price}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{plan.note}</p>
          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-slate-700"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}
          </ul>
          <Link to="/register" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">Get Started</Link>
        </Card>
      ))}
    </div>
  </section>
);

export const TestimonialsSection = () => (
  <section id="testimonials" className="bg-[#073f43] py-16 text-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight">Preview feedback for restaurant teams.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/80">Sample content is clearly identified until approved customer testimonials are available.</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {testimonials.map((item) => (
          <figure key={item.name} className="rounded-2xl border border-white/12 bg-white/8 p-5">
            <blockquote className="text-sm leading-7 text-white/88">"{item.quote}"</blockquote>
            <figcaption className="mt-5 text-sm font-semibold">{item.name}<span className="block text-xs font-normal text-emerald-100/70">{item.role}</span></figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export const LogoCloud = () => (
  <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="sample-restaurants-heading">
    <h2 id="sample-restaurants-heading" className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Sample restaurant profiles</h2>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {logoCloud.map((name) => <div key={name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center font-semibold text-slate-500">{name}</div>)}
    </div>
  </section>
);

export const FAQSection = () => {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight text-slate-950">Frequently asked questions</h2>
      <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {faqs.map((item, index) => {
          const id = `faq-panel-${index}`;
          return (
            <div key={item.question}>
              <button type="button" aria-expanded={open === index} aria-controls={id} onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold">
                {item.question}<ChevronDown aria-hidden className={classNames('h-5 w-5 shrink-0 transition', open === index && 'rotate-180')} />
              </button>
              <div id={id} className={classNames('px-5 text-sm leading-7 text-slate-600', open === index ? 'pb-5' : 'hidden')}>
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const ContactSection = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const required = ['name', 'email', 'restaurant', 'message'];
    if (required.some((key) => !String(form.get(key) || '').trim())) {
      setError('Please complete your name, email, restaurant name, and message.');
      setMessage('');
      return;
    }
    setError('');
    setMessage('Direct contact submission is not configured yet. Please use your official Tapro contact channel while the backend contact endpoint is added.');
  };

  return (
    <section id="contact" className="bg-slate-50 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Contact</p>
          <h2 className="mt-3 text-[clamp(2rem,6vw,3rem)] font-semibold tracking-tight text-slate-950">Talk through your restaurant setup.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">This frontend form is ready for backend integration, but no contact endpoint is currently configured in the frontend services.</p>
        </div>
        <Card>
          {/* TODO: Connect this form to an approved backend contact endpoint when one is available. */}
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <Input name="name" label="Name" required />
            <Input name="email" label="Email" type="email" required />
            <Input name="restaurant" label="Restaurant name" required />
            <Input name="phone" label="Phone number" />
            <div className="md:col-span-2"><Textarea name="message" label="Message" required /></div>
            {error ? <p className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            {message ? <p className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
            <div className="md:col-span-2"><Button type="submit" className="w-full sm:w-auto" leftIcon={<Mail aria-hidden className="h-4 w-4" />}>Prepare inquiry</Button></div>
          </form>
        </Card>
      </div>
    </section>
  );
};

export const LandingFooter = () => (
  <footer className="bg-slate-950 py-12 text-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
      <div className="md:col-span-2">
        <TaproLogo size="sm" className="max-w-[160px] rounded-xl bg-white px-3 py-2" />
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Tapro is a restaurant SaaS platform for QR ordering, digital menus, role-aware operations, and restaurant reporting.</p>
      </div>
      <div>
        <h2 className="text-sm font-semibold">Product</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          {landingNavItems.slice(0, 4).map((item) => <button key={item.href} type="button" onClick={() => scrollToSection(item.href)} className="text-left hover:text-white">{item.label}</button>)}
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold">Company</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          <Link to="/login" className="hover:text-white">Login</Link>
          <Link to="/register" className="hover:text-white">Registration</Link>
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms and Conditions</Link>
        </div>
      </div>
    </div>
    <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-6 text-sm text-slate-400 sm:px-6 lg:px-8">
      Copyright {new Date().getFullYear()} Tapro. All rights reserved.
    </div>
  </footer>
);
