import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const run = async () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment');
  }

  if (!secretKey.startsWith('sk_test_')) {
    console.warn(
      '[warn] STRIPE_SECRET_KEY does not look like a test key (expected sk_test_...)'
    );
  }

  const stripe = new Stripe(secretKey);

  const reference = `stripe_test_${Date.now()}`;

  console.log('[info] Creating Stripe test PaymentIntent...');

  const intent = await stripe.paymentIntents.create({
    amount: 15000,
    currency: 'pkr',
    payment_method_types: ['card'],
    confirm: true,
    payment_method_data: {
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    },
    description: `Philbox Stripe integration test ${reference}`,
    metadata: {
      source: 'server/src/tests/scripts/payments/testStripeTransaction.js',
      reference,
    },
  });

  console.log('[result] payment_intent_id:', intent.id);
  console.log('[result] status:', intent.status);
  console.log('[result] amount:', intent.amount);
  console.log('[result] currency:', intent.currency);

  if (intent.status !== 'succeeded') {
    throw new Error(`Expected succeeded, received ${intent.status}`);
  }

  console.log('[success] Stripe test transaction succeeded.');
};

run().catch(error => {
  console.error('[error]', error?.message || error);
  process.exit(1);
});
