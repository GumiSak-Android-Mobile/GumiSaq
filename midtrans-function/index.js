const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function (req, res) {
  try {
    const { amount, currency, customer } = JSON.parse(req.bodyRaw);

    if (!amount || !currency || !customer || !customer.email) {
      return res.send({ error: "Missing required fields" }, 400);
    }

    // Stripe expects amount in the smallest currency unit (e.g., cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // IDR to "sen"
      currency,
      receipt_email: customer.email,
      metadata: { customer_name: customer.name },
    });

    return res.send({ clientSecret: paymentIntent.client_secret }, 200);
  } catch (err) {
    return res.send({ error: err.message }, 500);
  }
};