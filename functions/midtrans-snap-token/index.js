const midtransClient = require("midtrans-client");

module.exports = async function (req, res) {
  const { orderId, amount, customer } = JSON.parse(req.body);

  if (!orderId || !amount || !customer) {
    return res.json({ error: "Missing required fields" }, 400);
  }

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });



  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
    },
  };
  console.log("BODY:", req.body);
  console.log("ENV:", process.env.MIDTRANS_SERVER_KEY, process.env.MIDTRANS_CLIENT_KEY);

  try {
    const transaction = await snap.createTransaction(parameter);
    return res.json({ token: transaction.token });
  } catch (err) {
    return res.json({ error: err.message }, 500);
  }
};