const sdk = require("node-appwrite");
const midtransClient = require("midtrans-client");

module.exports = async ({ req, res }) => {
  const payload = JSON.parse(req.body || "{}");
  const { amount, customer, orderId } = payload;

  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
      },
    });

    // Simpan ke database
    const database = new sdk.Databases(client);
    await database.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      sdk.ID.unique(),
      {
        orderId,
        amount,
        snapToken: transaction.token,
        status: "pending",
      }
    );

    return res.json({ token: transaction.token });
  } catch (err) {
    return res.json({ error: err.message }, 500);
  }
};
