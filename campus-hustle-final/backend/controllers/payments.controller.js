'use strict';

const env = require('../config/env');
const { AppError, asyncHandler } = require('../utils/errors');
const { requireFields } = require('../utils/validate');

const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (/^0(7|1)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  throw new AppError('Enter a valid Safaricom number, for example 0712 345 678.', 400);
};

const getDarajaBaseUrl = () =>
  env.mpesa.environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const hasDarajaCredentials = () =>
  env.mpesa.consumerKey &&
  env.mpesa.consumerSecret &&
  env.mpesa.shortcode &&
  env.mpesa.passkey &&
  env.mpesa.callbackUrl;

const getDarajaToken = async () => {
  const auth = Buffer
    .from(`${env.mpesa.consumerKey}:${env.mpesa.consumerSecret}`)
    .toString('base64');

  const response = await fetch(`${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) throw new AppError('Could not authenticate with M-PESA Daraja.', 502);
  const data = await response.json();
  return data.access_token;
};

const initiateMpesa = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['phone', 'amount']);
  if (missing) throw new AppError(missing, 400);

  const phone = normalizePhone(req.body.phone);
  const amount = Math.max(1, Math.round(Number(req.body.amount)));
  if (!Number.isFinite(amount)) throw new AppError('Amount must be a valid number.', 400);

  if (!hasDarajaCredentials()) {
    return res.status(200).json({
      success: true,
      mode: 'demo',
      message: 'Demo M-PESA request accepted. Add Daraja credentials to send a real STK Push.',
      checkoutRequestId: `DEMO-${Date.now()}`,
    });
  }

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = Buffer
    .from(`${env.mpesa.shortcode}${env.mpesa.passkey}${timestamp}`)
    .toString('base64');
  const token = await getDarajaToken();

  const response = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: env.mpesa.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: env.mpesa.shortcode,
      PhoneNumber: phone,
      CallBackURL: env.mpesa.callbackUrl,
      AccountReference: req.body.accountReference || 'HustleGrad',
      TransactionDesc: req.body.description || 'HustleGrad marketplace payment',
    }),
  });

  const data = await response.json();
  if (!response.ok || data.ResponseCode !== '0') {
    throw new AppError(data.errorMessage || data.ResponseDescription || 'M-PESA STK Push failed.', 502);
  }

  res.status(200).json({
    success: true,
    mode: 'daraja',
    message: data.CustomerMessage || 'STK Push sent. Check your phone.',
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  });
});

const mpesaCallback = asyncHandler(async (req, res) => {
  const callbackData = req.body?.Body?.stkCallback;

  if (!callbackData) {
    console.log('[MPESA CALLBACK] Received callback without stkCallback payload.');
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  console.log('[MPESA CALLBACK]', JSON.stringify(callbackData, null, 2));

  if (callbackData.ResultCode === 0) {
    const metaData = callbackData.CallbackMetadata?.Item || [];
    const mpesaReceiptNumber = metaData.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metaData.find(item => item.Name === 'Amount')?.Value;

    // Use this logic to update your database
    console.log(`Payment Successful! Receipt: ${mpesaReceiptNumber}, Amount: ${amount}`);
  } else {
    console.log('Payment Failed:', callbackData.ResultDesc);
  }

  res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
});

module.exports = { initiateMpesa, mpesaCallback };
