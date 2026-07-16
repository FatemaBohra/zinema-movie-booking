import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface CheckoutFormProps {
    clientSecret: string
    onSuccess: (paymentIntentId: string) => void
    onCancel: () => void
    amount: number
}

const CheckoutForm = ({ clientSecret, onSuccess, onCancel, amount }: CheckoutFormProps) => {
    const stripe = useStripe()
    const elements = useElements()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!stripe || !elements) return

        setProcessing(true)
        setError(null)

        try {
            // Step 1 — must call submit first
            const { error: submitError } = await elements.submit()
            if (submitError) {
                setError(submitError.message || 'Payment failed')
                return
            }

            // Step 2 — confirm payment
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: window.location.origin,
                    payment_method_data: {
                        billing_details: {
                            address: {
                                country: 'CA',
                                postal_code: 'A1A 1A1',
                                line1: 'N/A',
                                city: 'N/A',
                                state: 'NS',
                            }
                        }
                    }
                },
                redirect: 'if_required',
            })

            console.log('Payment result:', { confirmError, paymentIntent })

            if (confirmError) {
                setError(confirmError.message || 'Payment failed')
                return
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id)
            } else {
                setError('Payment was not completed. Status: ' + paymentIntent?.status)
            }
        } catch (err) {
            console.error('Payment exception:', err)
            setError('Payment failed. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem',
        }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Complete Payment
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Total: <span style={{ color: 'var(--accent)', fontWeight: '700' }}>CA${amount}</span>
            </p>

            <div style={{
                backgroundColor: 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
            }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Test card details
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Card: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>4242 4242 4242 4242</span>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Expiry: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>12 / 27</span>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    CVC: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>123</span>
                </p>
            </div>

            <PaymentElement
                options={{
                    layout: 'tabs',
                    paymentMethodOrder: ['card'],
                    fields: {
                        billingDetails: {
                            address: 'never',
                        }
                    },
                    wallets: {
                        applePay: 'never',
                        googlePay: 'never',
                    }
                }}
            />

            {error && (
                <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '1rem' }}>
                    {error}
                </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    onClick={handleSubmit}
                    disabled={processing || !stripe}
                    style={{
                        flex: 1,
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        opacity: processing ? 0.7 : 1,
                    }}
                >
                    {processing ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                    onClick={onCancel}
                    disabled={processing}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

interface StripeCheckoutProps {
    clientSecret: string
    onSuccess: (paymentIntentId: string) => void
    onCancel: () => void
    amount: number
}

const StripeCheckout = ({ clientSecret, onSuccess, onCancel, amount }: StripeCheckoutProps) => {
    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#ff6b6b',
                        colorBackground: '#141414',
                        colorText: '#ffffff',
                        colorDanger: '#ff6b6b',
                        borderRadius: '6px',
                    }
                }
            }}
        >
            <CheckoutForm
                clientSecret={clientSecret}
                onSuccess={onSuccess}
                onCancel={onCancel}
                amount={amount}
            />
        </Elements>
    )
}

export default StripeCheckout