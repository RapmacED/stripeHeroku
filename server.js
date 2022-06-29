const env = require("dotenv");
env.config({ path: "./.env" });
const express = require("express");
const Stripe = require("stripe");

const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";


const app = express();
app.use(express.json())

//Confirm the API version from your stripe dashboard
const stripe = Stripe(stripeSecretKey, { apiVersion: "2020-08-27" });

app.get("/get-publishable-key", async(req, res) => {
  if(stripePublishableKey.length){
    res.statusCode = (200)
    res.json({publishableKeyFromServer: stripePublishableKey})
  }
  else{
    res.statusCode = (503)
    res.json({error: "Publishable key not available!"})
  }
})

app.post("/create-payment-intent", async (req, res) => {
  const {paymentMethodType, currency, amount} = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount), //lowest denomination of particular currency
      currency: currency,
      payment_method_types: [paymentMethodType],
      description: 'Application de réservation pour la réstauration',
      shipping: {
        name: 'Zeep App',
        address: {
          line1: '11 rue La Fayette',
          postal_code: '44000',
          city: 'Nantes',
          state: 'Loire Atlantique',
          country: 'FR',
        },
      },
    });

    const clientSecret = paymentIntent.client_secret;

    res.json({
      clientSecret: clientSecret,
    });
  } catch (e) {
    console.log(e.message);
    res.json({ error: e.message });
  }
});

app.all(/.*/, (req, res) => {
  res.statusCode = (404)
  res.send('Invalid Endpoint.')
})


const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is listening at port number : ${PORT}`);
})

