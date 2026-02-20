'use client';

import { useState } from 'react';
import { useCart } from '@/store/cart';
import { useRouter } from 'next/navigation';

const MARINAS = [
  'Port Adriano, Mallorca',
  'Marina Ibiza',
  'Puerto Portals, Mallorca',
  'Club de Mar, Palma',
  'Marina Port de Mallorca',
  'STP Shipyard, Palma',
  'Marina Santa Eulalia, Ibiza',
  'Port Tarraco, Tarragona',
  'Marina Real, Valencia',
  'Puerto Banús, Marbella',
  'Port Vell, Barcelona',
  'Marina Botafoch, Ibiza',
];

export default function CheckoutPage() {
  const { items, totalPrice, deliveryMethod, setDeliveryMethod, clearCart, totalItems } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    contactName: '',
    phone: '',
    boatName: '',
    marina: '',
    berth: '',
    notes: '',
    pickupTime: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'paypal'>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const deliveryFee = deliveryMethod === 'delivery' ? 9.95 : 0;
  const grandTotal = totalPrice + deliveryFee;

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };
  const detectCardBrand = (num: string): string => {
    const d = num.replace(/\s/g, '');
    if (/^4/.test(d)) return 'visa';
    if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'mastercard';
    if (/^3[47]/.test(d)) return 'amex';
    return 'unknown';
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.contactName.trim()) errs.contactName = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (deliveryMethod === 'delivery') {
      if (!form.marina) errs.marina = 'Select a marina';
      if (!form.boatName.trim()) errs.boatName = 'Required';
    }
    if (deliveryMethod === 'pickup' && !form.pickupTime) errs.pickupTime = 'Select a time';
    setErrors(errs);

    const cErrs: Record<string, string> = {};
    if (paymentMethod === 'card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length < 13) cErrs.number = 'Enter card number';
      if (card.expiry.length < 5) cErrs.expiry = 'MM/YY';
      if (card.cvc.length < 3) cErrs.cvc = 'CVC';
      if (!card.name.trim()) cErrs.name = 'Required';
    }
    setCardErrors(cErrs);

    return Object.keys(errs).length === 0 && Object.keys(cErrs).length === 0;
  };

  const handleSubmit = () => { if (validate()) setStep(2); };
  const handleConfirm = () => { setStep(3); setTimeout(() => clearCart(), 1000); };

  const fieldCls = (field: string) =>
    `input-field ${errors[field] ? 'error' : ''}`;
  const selectCls = (field: string, hasValue: boolean) =>
    `input-field select-arrow appearance-none ${errors[field] ? 'error' : ''} ${!hasValue ? '!text-[var(--c-text-muted)]' : ''}`;

  // Empty cart
  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-svh bg-[var(--c-bg)] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-[var(--c-fill)] flex items-center justify-center mb-5 anim-float">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <p className="text-[18px] font-bold text-[var(--c-text)] mb-1">Your cart is empty</p>
        <p className="text-[var(--c-text-muted)] text-[15px] mb-6 max-w-[220px] text-center">Add some products before checking out</p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary px-6 h-[48px] rounded-2xl font-semibold text-[16px]"
        >
          Browse products
        </button>
      </div>
    );
  }

  // Success — native confirmation
  if (step === 3) {
    return (
      <div className="min-h-svh bg-[var(--c-bg)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-[76px] h-[76px] rounded-full bg-[var(--c-success)] flex items-center justify-center mb-6 anim-scale-in"
          style={{ boxShadow: '0 6px 24px rgba(48,209,88,0.3)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 'check-draw 0.4s ease 0.2s both' }} />
          </svg>
        </div>
        <h2 className="text-[24px] font-bold text-[var(--c-text)] mb-1.5 tracking-tight">Order placed!</h2>
        <p className="text-[var(--c-text-secondary)] text-[15px] max-w-[260px]">
          {deliveryMethod === 'delivery'
            ? `Delivering to ${form.boatName} at ${form.marina}`
            : 'Your order will be ready for pickup'}
        </p>
        <div className="bg-[var(--c-fill)] px-4 py-1.5 rounded-lg mt-3 mb-8">
          <p className="text-[13px] font-mono text-[var(--c-text-muted)]">
            #YD-{Math.random().toString(36).slice(2, 8).toUpperCase()}
          </p>
        </div>

        <div className="cell-group w-full max-w-xs mb-8">
          <div className="cell">
            <span className="text-[14px] text-[var(--c-text-secondary)] flex-1">Items</span>
            <span className="text-[14px] font-semibold">{totalItems}</span>
          </div>
          <div className="cell">
            <span className="text-[14px] text-[var(--c-text-secondary)] flex-1">Subtotal</span>
            <span className="text-[14px] font-semibold">€{totalPrice.toFixed(2)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="cell">
              <span className="text-[14px] text-[var(--c-text-secondary)] flex-1">Delivery</span>
              <span className="text-[14px] font-semibold">€{deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="cell">
            <span className="text-[15px] font-bold flex-1">Total</span>
            <span className="text-[17px] font-bold">€{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="btn-dark px-8 h-[50px] rounded-2xl font-semibold text-[16px]"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--c-bg)]">
      {/* Nav bar */}
      <div className="bg-white/80 backdrop-blur-xl px-4 h-[48px] safe-top flex items-center gap-3 border-b border-[var(--c-border)] sticky top-0 z-30"
        style={{ WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
      >
        <button
          onClick={() => step === 1 ? router.back() : setStep(1)}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[var(--c-accent)] active:bg-[var(--c-fill)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[17px] font-semibold text-[var(--c-text)] flex-1 text-center pr-[34px]">
          {step === 1 ? 'Checkout' : 'Confirm'}
        </h1>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex gap-1.5 mb-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="h-[3px] flex-1 rounded-full transition-all duration-500"
              style={{
                background: step >= s ? 'var(--c-accent)' : 'var(--c-fill)',
                transitionTimingFunction: 'var(--ease-out)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider px-1">
          <span className={step >= 1 ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-muted)]'}>Details</span>
          <span className={step >= 2 ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-muted)]'}>Review</span>
          <span className={step >= 3 ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-muted)]'}>Done</span>
        </div>
      </div>

      {step === 1 && (
        <div className="px-4 pb-28 space-y-4 mt-1">
          {/* Method — iOS segmented */}
          <div className="cell-group p-4">
            <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">Delivery method</p>
            <div className="segmented-control">
              <div
                className="segmented-thumb"
                style={{
                  left: deliveryMethod === 'delivery' ? '2px' : '50%',
                  width: 'calc(50% - 2px)',
                }}
              />
              {(['delivery', 'pickup'] as const).map(m => (
                <button
                  key={m}
                  data-active={deliveryMethod === m || undefined}
                  onClick={() => setDeliveryMethod(m)}
                >
                  {m === 'delivery' ? 'Boat delivery' : 'Marina pickup'}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="cell-group p-4">
            <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">Contact</p>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                  className={fieldCls('contactName')}
                  autoComplete="name"
                />
                {errors.contactName && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{errors.contactName}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={fieldCls('phone')}
                  autoComplete="tel"
                />
                {errors.phone && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Delivery details */}
          {deliveryMethod === 'delivery' && (
            <div className="cell-group p-4 anim-fade-in">
              <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">Delivery details</p>
              <div className="space-y-3">
                <div>
                  <select
                    value={form.marina}
                    onChange={e => setForm({ ...form, marina: e.target.value })}
                    className={selectCls('marina', !!form.marina)}
                  >
                    <option value="">Select marina</option>
                    {MARINAS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {errors.marina && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{errors.marina}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Boat name"
                    value={form.boatName}
                    onChange={e => setForm({ ...form, boatName: e.target.value })}
                    className={fieldCls('boatName')}
                  />
                  {errors.boatName && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{errors.boatName}</p>}
                </div>
                <input
                  type="text"
                  placeholder="Berth / pontoon (optional)"
                  value={form.berth}
                  onChange={e => setForm({ ...form, berth: e.target.value })}
                  className={fieldCls('')}
                />
              </div>
            </div>
          )}

          {/* Pickup details */}
          {deliveryMethod === 'pickup' && (
            <div className="cell-group p-4 anim-fade-in">
              <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2">Pickup</p>
              <div className="flex items-center gap-2 mb-3 text-[var(--c-accent)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-[13px] font-semibold">NautiChandler, Palma de Mallorca</span>
              </div>
              <div>
                <select
                  value={form.pickupTime}
                  onChange={e => setForm({ ...form, pickupTime: e.target.value })}
                  className={selectCls('pickupTime', !!form.pickupTime)}
                >
                  <option value="">Pickup time</option>
                  <option value="09:00-10:00">09:00 – 10:00</option>
                  <option value="10:00-11:00">10:00 – 11:00</option>
                  <option value="11:00-12:00">11:00 – 12:00</option>
                  <option value="12:00-13:00">12:00 – 13:00</option>
                  <option value="14:00-15:00">14:00 – 15:00</option>
                  <option value="15:00-16:00">15:00 – 16:00</option>
                  <option value="16:00-17:00">16:00 – 17:00</option>
                </select>
                {errors.pickupTime && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{errors.pickupTime}</p>}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="cell-group p-4">
            <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">
              Notes <span className="normal-case font-normal">(optional)</span>
            </p>
            <textarea
              placeholder="Special instructions..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-3 rounded-lg bg-[var(--c-fill)] text-[16px] text-[var(--c-text)] resize-none border-2 border-transparent focus:border-[var(--c-accent)] focus:bg-white transition-all placeholder-[var(--c-text-muted)]"
              style={{ outline: 'none' }}
            />
          </div>

          {/* Payment method */}
          <div className="cell-group p-4">
            <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">Payment method</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { id: 'card' as const, label: 'Credit card', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="3" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                )},
                { id: 'apple_pay' as const, label: 'Apple Pay', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.72 7.54c-.46.52-1.2.92-1.95.86-.09-.75.28-1.54.71-2.03.46-.53 1.27-.91 1.92-.94.08.78-.23 1.56-.68 2.11zM18.4 8.5c-1.08-.06-2 .61-2.52.61-.52 0-1.31-.58-2.17-.57-1.11.02-2.15.65-2.72 1.65-1.16 2.01-.3 5 .83 6.63.56.81 1.22 1.71 2.09 1.68.84-.03 1.16-.54 2.17-.54 1.02 0 1.3.54 2.18.52.9-.01 1.47-.82 2.02-1.63.64-.93.9-1.83.91-1.88-.02-.01-1.75-.67-1.77-2.67-.01-1.67 1.37-2.47 1.43-2.51-.78-1.15-2-1.28-2.43-1.3z" />
                  </svg>
                )},
                { id: 'google_pay' as const, label: 'Google Pay', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M12.24 10.28V14.1h5.05c-.22 1.4-.84 2.58-1.78 3.38l2.87 2.23c1.68-1.55 2.65-3.83 2.65-6.53 0-.63-.06-1.24-.16-1.83H12.24z" />
                    <path fill="#34A853" d="M5.28 14.27l-.65.5-2.3 1.79C3.96 19.58 7.7 21.5 12 21.5c2.97 0 5.46-1 7.28-2.69l-2.87-2.23c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53l-.26.16z" />
                    <path fill="#FBBC05" d="M2.33 7.44A9.96 9.96 0 0 0 1.5 12c0 1.65.3 3.22.83 4.56l2.95-2.29a5.94 5.94 0 0 1 0-4.54L2.33 7.44z" />
                    <path fill="#EA4335" d="M12 6.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C16.46 3.89 14.47 2.5 12 2.5 7.7 2.5 3.96 4.42 2.33 7.44l2.95 2.29C6.15 7.63 8.58 6.58 12 6.58z" />
                  </svg>
                )},
                { id: 'paypal' as const, label: 'PayPal', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#003087">
                    <path d="M7.02 21.5L7.55 18h-.97l2.46-15.5h5.08c2.8 0 4.33 1.48 3.98 3.87-.47 3.2-2.96 4.93-5.98 4.93H9.9l-1.07 6.7H7.02zm4.7-8.2h1.58c1.82 0 3.36-1.1 3.65-3.08.18-1.2-.56-2.22-2.14-2.22H12.8l-1.08 5.3z" />
                  </svg>
                )},
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === id
                      ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/5'
                      : 'border-[var(--c-border)] bg-[var(--c-fill-secondary)] active:scale-[0.98]'
                  }`}
                >
                  <span className={paymentMethod === id ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-secondary)]'}>{icon}</span>
                  <span className={`text-[13px] font-semibold ${
                    paymentMethod === id ? 'text-[var(--c-accent)]' : 'text-[var(--c-text)]'
                  }`}>{label}</span>
                </button>
              ))}
            </div>

            {/* Card fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 anim-fade-in">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Card number"
                      value={card.number}
                      onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                      className={`input-field !pr-14 ${cardErrors.number ? 'error' : ''}`}
                      autoComplete="cc-number"
                    />
                    {/* Card brand icon */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {detectCardBrand(card.number) === 'visa' && (
                        <span className="text-[10px] font-bold text-white bg-[#1a1f71] rounded px-1.5 py-0.5">VISA</span>
                      )}
                      {detectCardBrand(card.number) === 'mastercard' && (
                        <span className="flex">
                          <span className="w-4 h-4 rounded-full bg-[#eb001b] -mr-1.5" />
                          <span className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-80" />
                        </span>
                      )}
                      {detectCardBrand(card.number) === 'amex' && (
                        <span className="text-[9px] font-bold text-white bg-[#006fcf] rounded px-1 py-0.5">AMEX</span>
                      )}
                    </span>
                  </div>
                  {cardErrors.number && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{cardErrors.number}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Cardholder name"
                    value={card.name}
                    onChange={e => setCard({ ...card, name: e.target.value })}
                    className={`input-field ${cardErrors.name ? 'error' : ''}`}
                    autoComplete="cc-name"
                  />
                  {cardErrors.name && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{cardErrors.name}</p>}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      className={`input-field ${cardErrors.expiry ? 'error' : ''}`}
                      autoComplete="cc-exp"
                      maxLength={5}
                    />
                    {cardErrors.expiry && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{cardErrors.expiry}</p>}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="CVC"
                        value={card.cvc}
                        onChange={e => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className={`input-field ${cardErrors.cvc ? 'error' : ''}`}
                        autoComplete="cc-csc"
                        maxLength={4}
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="5" width="20" height="14" rx="3" />
                        <rect x="5" y="10" width="5" height="4" rx="1" fill="currentColor" opacity="0.3" />
                      </svg>
                    </div>
                    {cardErrors.cvc && <p className="text-[var(--c-error)] text-[12px] mt-1 ml-1 font-medium">{cardErrors.cvc}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[12px] text-[var(--c-text-muted)]">Encrypted & secure payment</span>
                </div>
              </div>
            )}

            {/* Wallet methods info */}
            {paymentMethod === 'apple_pay' && (
              <div className="flex items-center gap-3 bg-[var(--c-fill-secondary)] rounded-xl p-3.5 anim-fade-in">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.72 7.54c-.46.52-1.2.92-1.95.86-.09-.75.28-1.54.71-2.03.46-.53 1.27-.91 1.92-.94.08.78-.23 1.56-.68 2.11zM18.4 8.5c-1.08-.06-2 .61-2.52.61-.52 0-1.31-.58-2.17-.57-1.11.02-2.15.65-2.72 1.65-1.16 2.01-.3 5 .83 6.63.56.81 1.22 1.71 2.09 1.68.84-.03 1.16-.54 2.17-.54 1.02 0 1.3.54 2.18.52.9-.01 1.47-.82 2.02-1.63.64-.93.9-1.83.91-1.88-.02-.01-1.75-.67-1.77-2.67-.01-1.67 1.37-2.47 1.43-2.51-.78-1.15-2-1.28-2.43-1.3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">Apple Pay</p>
                  <p className="text-[12px] text-[var(--c-text-muted)]">You'll confirm with Face ID or Touch ID</p>
                </div>
              </div>
            )}
            {paymentMethod === 'google_pay' && (
              <div className="flex items-center gap-3 bg-[var(--c-fill-secondary)] rounded-xl p-3.5 anim-fade-in">
                <div className="w-10 h-10 rounded-lg bg-white border border-[var(--c-border)] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M12.24 10.28V14.1h5.05c-.22 1.4-.84 2.58-1.78 3.38l2.87 2.23c1.68-1.55 2.65-3.83 2.65-6.53 0-.63-.06-1.24-.16-1.83H12.24z" />
                    <path fill="#34A853" d="M5.28 14.27l-.65.5-2.3 1.79C3.96 19.58 7.7 21.5 12 21.5c2.97 0 5.46-1 7.28-2.69l-2.87-2.23c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53l-.26.16z" />
                    <path fill="#FBBC05" d="M2.33 7.44A9.96 9.96 0 0 0 1.5 12c0 1.65.3 3.22.83 4.56l2.95-2.29a5.94 5.94 0 0 1 0-4.54L2.33 7.44z" />
                    <path fill="#EA4335" d="M12 6.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C16.46 3.89 14.47 2.5 12 2.5 7.7 2.5 3.96 4.42 2.33 7.44l2.95 2.29C6.15 7.63 8.58 6.58 12 6.58z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">Google Pay</p>
                  <p className="text-[12px] text-[var(--c-text-muted)]">You'll confirm in the Google Pay popup</p>
                </div>
              </div>
            )}
            {paymentMethod === 'paypal' && (
              <div className="flex items-center gap-3 bg-[var(--c-fill-secondary)] rounded-xl p-3.5 anim-fade-in">
                <div className="w-10 h-10 rounded-lg bg-[#ffc43a] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087">
                    <path d="M7.02 21.5L7.55 18h-.97l2.46-15.5h5.08c2.8 0 4.33 1.48 3.98 3.87-.47 3.2-2.96 4.93-5.98 4.93H9.9l-1.07 6.7H7.02zm4.7-8.2h1.58c1.82 0 3.36-1.1 3.65-3.08.18-1.2-.56-2.22-2.14-2.22H12.8l-1.08 5.3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">PayPal</p>
                  <p className="text-[12px] text-[var(--c-text-muted)]">You'll be redirected to PayPal to pay</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="cell-group overflow-visible">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider">Summary</p>
            </div>
            {items.map(item => (
              <div key={item.id} className="cell">
                <span className="text-[14px] text-[var(--c-text-secondary)] truncate flex-1 mr-3">
                  {item.name} <span className="text-[var(--c-text-muted)]">x{item.quantity}</span>
                </span>
                <span className="text-[14px] font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="h-px bg-[var(--c-border)] mx-4" />
            <div className="cell">
              <span className="text-[14px] text-[var(--c-text-secondary)]">Subtotal</span>
              <span className="flex-1" />
              <span className="text-[14px] font-semibold">€{totalPrice.toFixed(2)}</span>
            </div>
            <div className="cell">
              <span className="text-[14px] text-[var(--c-text-secondary)]">
                {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>
              <span className="flex-1" />
              <span className={`text-[14px] font-semibold ${deliveryFee === 0 ? 'text-[var(--c-success)]' : ''}`}>
                {deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : 'Free'}
              </span>
            </div>
            <div className="h-px bg-[var(--c-border)] mx-4" />
            <div className="cell">
              <span className="text-[15px] font-bold">Total</span>
              <span className="flex-1" />
              <span className="text-[18px] font-bold">€{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-4 pb-28 space-y-4 mt-1 anim-fade-in">
          {/* Order review */}
          <div className="cell-group p-4">
            <p className="text-[17px] font-bold text-[var(--c-text)] mb-3">Review your order</p>
            <div className="space-y-2">
              {[
                {
                  label: deliveryMethod === 'delivery' ? 'Boat delivery' : 'Marina pickup',
                  value: deliveryMethod === 'delivery'
                    ? `${form.boatName} at ${form.marina}${form.berth ? `, Berth ${form.berth}` : ''}`
                    : `NautiChandler at ${form.pickupTime}`,
                },
                { label: 'Contact', value: `${form.contactName} · ${form.phone}` },
                { label: 'Order', value: `${totalItems} item${totalItems !== 1 ? 's' : ''} · €${grandTotal.toFixed(2)}` },
                { label: 'Payment', value: paymentMethod === 'card'
                  ? `${detectCardBrand(card.number) !== 'unknown' ? detectCardBrand(card.number).toUpperCase() : 'Card'} •••• ${card.number.replace(/\s/g, '').slice(-4) || '----'}`
                  : paymentMethod === 'apple_pay' ? 'Apple Pay'
                  : paymentMethod === 'google_pay' ? 'Google Pay'
                  : 'PayPal'
                },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[var(--c-fill-secondary)] rounded-xl p-3.5">
                  <p className="text-[11px] text-[var(--c-text-muted)] font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-[14px] text-[var(--c-text)] font-medium mt-0.5">{value}</p>
                </div>
              ))}
              {form.notes && (
                <div className="bg-[var(--c-fill-secondary)] rounded-xl p-3.5">
                  <p className="text-[11px] text-[var(--c-text-muted)] font-semibold uppercase tracking-wider">Notes</p>
                  <p className="text-[14px] text-[var(--c-text)] mt-0.5">{form.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="cell-group p-4">
            <p className="text-[13px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">Payment</p>
            <div className="flex items-center gap-3 bg-[var(--c-fill-secondary)] rounded-xl p-3.5">
              {paymentMethod === 'card' && (
                <>
                  {detectCardBrand(card.number) === 'visa' && <span className="text-[11px] font-bold text-white bg-[#1a1f71] rounded px-2 py-1">VISA</span>}
                  {detectCardBrand(card.number) === 'mastercard' && (
                    <span className="flex -space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#eb001b]" />
                      <span className="w-5 h-5 rounded-full bg-[#f79e1b] opacity-80" />
                    </span>
                  )}
                  {detectCardBrand(card.number) === 'amex' && <span className="text-[10px] font-bold text-white bg-[#006fcf] rounded px-1.5 py-0.5">AMEX</span>}
                  {detectCardBrand(card.number) === 'unknown' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-secondary)" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="3" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  )}
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[var(--c-text)]">•••• {card.number.replace(/\s/g, '').slice(-4) || '----'}</p>
                    <p className="text-[12px] text-[var(--c-text-muted)]">{card.name || 'Card'} · {card.expiry || '--/--'}</p>
                  </div>
                </>
              )}
              {paymentMethod === 'apple_pay' && (
                <>
                  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.72 7.54c-.46.52-1.2.92-1.95.86-.09-.75.28-1.54.71-2.03.46-.53 1.27-.91 1.92-.94.08.78-.23 1.56-.68 2.11zM18.4 8.5c-1.08-.06-2 .61-2.52.61-.52 0-1.31-.58-2.17-.57-1.11.02-2.15.65-2.72 1.65-1.16 2.01-.3 5 .83 6.63.56.81 1.22 1.71 2.09 1.68.84-.03 1.16-.54 2.17-.54 1.02 0 1.3.54 2.18.52.9-.01 1.47-.82 2.02-1.63.64-.93.9-1.83.91-1.88-.02-.01-1.75-.67-1.77-2.67-.01-1.67 1.37-2.47 1.43-2.51-.78-1.15-2-1.28-2.43-1.3z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[var(--c-text)]">Apple Pay</p>
                    <p className="text-[12px] text-[var(--c-text-muted)]">Confirm with Face ID</p>
                  </div>
                </>
              )}
              {paymentMethod === 'google_pay' && (
                <>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[var(--c-border)] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M12.24 10.28V14.1h5.05c-.22 1.4-.84 2.58-1.78 3.38l2.87 2.23c1.68-1.55 2.65-3.83 2.65-6.53 0-.63-.06-1.24-.16-1.83H12.24z" /><path fill="#34A853" d="M5.28 14.27l-.65.5-2.3 1.79C3.96 19.58 7.7 21.5 12 21.5c2.97 0 5.46-1 7.28-2.69l-2.87-2.23c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53l-.26.16z" /><path fill="#FBBC05" d="M2.33 7.44A9.96 9.96 0 0 0 1.5 12c0 1.65.3 3.22.83 4.56l2.95-2.29a5.94 5.94 0 0 1 0-4.54L2.33 7.44z" /><path fill="#EA4335" d="M12 6.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C16.46 3.89 14.47 2.5 12 2.5 7.7 2.5 3.96 4.42 2.33 7.44l2.95 2.29C6.15 7.63 8.58 6.58 12 6.58z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[var(--c-text)]">Google Pay</p>
                    <p className="text-[12px] text-[var(--c-text-muted)]">Linked account</p>
                  </div>
                </>
              )}
              {paymentMethod === 'paypal' && (
                <>
                  <div className="w-8 h-8 rounded-lg bg-[#ffc43a] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#003087"><path d="M7.02 21.5L7.55 18h-.97l2.46-15.5h5.08c2.8 0 4.33 1.48 3.98 3.87-.47 3.2-2.96 4.93-5.98 4.93H9.9l-1.07 6.7H7.02zm4.7-8.2h1.58c1.82 0 3.36-1.1 3.65-3.08.18-1.2-.56-2.22-2.14-2.22H12.8l-1.08 5.3z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[var(--c-text)]">PayPal</p>
                    <p className="text-[12px] text-[var(--c-text-muted)]">Redirect on confirm</p>
                  </div>
                </>
              )}
              <div className="w-[22px] h-[22px] rounded-full bg-[var(--c-success)] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {step < 3 && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-[var(--c-border)] safe-bottom"
          style={{ WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
        >
          <button
            onClick={step === 1 ? handleSubmit : handleConfirm}
            className="btn-dark w-full h-[52px] rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2.5"
          >
            <span>{step === 1 ? 'Continue to review' : 'Place order'}</span>
            <span className="text-white/25">·</span>
            <span>€{grandTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
