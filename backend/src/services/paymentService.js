const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.config = {
      yas: {
        apiUrl: process.env.YAS_API_URL,
        merchantId: process.env.YAS_MERCHANT_ID,
        apiKey: process.env.YAS_API_KEY,
        webhookSecret: process.env.YAS_WEBHOOK_SECRET
      },
      flooz: {
        apiUrl: process.env.FLOOZ_API_URL,
        merchantId: process.env.FLOOZ_MERCHANT_ID,
        apiKey: process.env.FLOOZ_API_KEY,
        webhookSecret: process.env.FLOOZ_WEBHOOK_SECRET
      },
      bceao: {
        apiUrl: process.env.BCEAO_API_URL,
        merchantId: process.env.BCEAO_MERCHANT_ID,
        apiKey: process.env.BCEAO_API_KEY,
        certificatePath: process.env.BCEAO_CERTIFICATE_PATH
      }
    };
  }

  /**
   * Générer une signature pour authentifier les requêtes
   */
  generateSignature(data, secret) {
    const sortedData = Object.keys(data)
      .sort()
      .reduce((result, key) => {
        result[key] = data[key];
        return result;
      }, {});
    
    const queryString = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', secret)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Traitement des paiements YAS Mobile Money
   */
  async processYASPayment({ transactionId, amount, phoneNumber, description }) {
    try {
      const requestData = {
        merchant_id: this.config.yas.merchantId,
        transaction_id: transactionId,
        amount: amount,
        currency: 'XOF',
        phone_number: phoneNumber,
        description: description,
        callback_url: `${process.env.API_BASE_URL}/api/webhooks/yas/payment`,
        return_url: `${process.env.FRONTEND_URL}/wallet/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/wallet/payment-cancel`,
        timestamp: Date.now()
      };

      const signature = this.generateSignature(requestData, this.config.yas.apiKey);

      const response = await axios.post(
        `${this.config.yas.apiUrl}/payment/initiate`,
        {
          ...requestData,
          signature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.yas.apiKey}`
          },
          timeout: 30000
        }
      );

      if (response.data.status === 'success') {
        return {
          status: 'PROCESSING',
          externalRef: response.data.payment_token,
          approvalUrl: response.data.payment_url,
          instructions: 'Composez *155# sur votre téléphone Togocel pour approuver le paiement'
        };
      } else {
        throw new Error(`YAS API Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Erreur paiement YAS:', error.response?.data || error.message);
      throw new Error(`Échec du paiement YAS: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Traitement des paiements FLOOZ
   */
  async processFLOOZPayment({ transactionId, amount, phoneNumber, description }) {
    try {
      const requestData = {
        merchant: this.config.flooz.merchantId,
        reference: transactionId,
        amount: amount,
        phone: phoneNumber,
        description: description,
        notif_url: `${process.env.API_BASE_URL}/api/webhooks/flooz/payment`,
        return_url: `${process.env.FRONTEND_URL}/wallet/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/wallet/payment-cancel`
      };

      const response = await axios.post(
        `${this.config.flooz.apiUrl}/pay`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.config.flooz.apiKey
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        return {
          status: 'PROCESSING',
          externalRef: response.data.token,
          approvalUrl: response.data.payment_url,
          instructions: 'Validez le paiement sur votre téléphone Moov en composant *155*7#'
        };
      } else {
        throw new Error(`FLOOZ API Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Erreur paiement FLOOZ:', error.response?.data || error.message);
      throw new Error(`Échec du paiement FLOOZ: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Traitement des paiements par carte (Visa/Mastercard)
   */
  async processCardPayment({ transactionId, amount, cardToken, description }) {
    try {
      // Cette implémentation utiliserait une passerelle de paiement comme Stripe, PayPal, ou un processeur local
      // Pour l'exemple, nous utilisons une simulation
      
      const requestData = {
        transaction_id: transactionId,
        amount: amount,
        currency: 'XOF',
        card_token: cardToken,
        description: description,
        merchant_id: 'ecom_merchant_001'
      };

      // Simulation d'appel à une passerelle de paiement
      const response = await axios.post(
        'https://api.payment-gateway.com/v1/charges',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_SECRET}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        status: response.data.status === 'succeeded' ? 'COMPLETED' : 'PROCESSING',
        externalRef: response.data.charge_id,
        approvalUrl: response.data.receipt_url
      };
    } catch (error) {
      console.error('Erreur paiement carte:', error.response?.data || error.message);
      throw new Error(`Échec du paiement par carte: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Traitement des paiements PI-SPI BCEAO
   */
  async processBCEAOPayment({ transactionId, amount, description }) {
    try {
      const requestData = {
        merchantId: this.config.bceao.merchantId,
        transactionId: transactionId,
        amount: amount,
        currency: 'XOF',
        description: description,
        returnUrl: `${process.env.FRONTEND_URL}/wallet/payment-success`,
        cancelUrl: `${process.env.FRONTEND_URL}/wallet/payment-cancel`,
        notificationUrl: `${process.env.API_BASE_URL}/api/webhooks/bceao/payment`,
        timestamp: new Date().toISOString()
      };

      // Chargement du certificat BCEAO si nécessaire
      // const certificate = fs.readFileSync(this.config.bceao.certificatePath);

      const response = await axios.post(
        `${this.config.bceao.apiUrl}/payment/init`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.bceao.apiKey}`,
            'X-Merchant-ID': this.config.bceao.merchantId
          },
          timeout: 45000 // BCEAO peut être plus lent
        }
      );

      if (response.data.responseCode === '00') {
        return {
          status: 'PROCESSING',
          externalRef: response.data.paymentToken,
          approvalUrl: response.data.paymentUrl,
          instructions: 'Vous allez être redirigé vers la page de paiement sécurisée BCEAO'
        };
      } else {
        throw new Error(`BCEAO API Error: ${response.data.responseMessage}`);
      }
    } catch (error) {
      console.error('Erreur paiement BCEAO:', error.response?.data || error.message);
      throw new Error(`Échec du paiement BCEAO: ${error.response?.data?.responseMessage || error.message}`);
    }
  }

  /**
   * Traitement des retraits YAS
   */
  async processYASWithdrawal({ transactionId, amount, phoneNumber, description }) {
    try {
      const requestData = {
        merchant_id: this.config.yas.merchantId,
        transaction_id: transactionId,
        amount: amount,
        currency: 'XOF',
        phone_number: phoneNumber,
        description: description,
        callback_url: `${process.env.API_BASE_URL}/api/webhooks/yas/withdrawal`
      };

      const signature = this.generateSignature(requestData, this.config.yas.apiKey);

      const response = await axios.post(
        `${this.config.yas.apiUrl}/withdrawal/initiate`,
        {
          ...requestData,
          signature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.yas.apiKey}`
          },
          timeout: 30000
        }
      );

      if (response.data.status === 'success') {
        return {
          status: 'PROCESSING',
          externalRef: response.data.withdrawal_token
        };
      } else {
        throw new Error(`YAS Withdrawal Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Erreur retrait YAS:', error.response?.data || error.message);
      throw new Error(`Échec du retrait YAS: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Traitement des retraits FLOOZ
   */
  async processFLOOZWithdrawal({ transactionId, amount, phoneNumber, description }) {
    try {
      const requestData = {
        merchant: this.config.flooz.merchantId,
        reference: transactionId,
        amount: amount,
        phone: phoneNumber,
        description: description,
        notif_url: `${process.env.API_BASE_URL}/api/webhooks/flooz/withdrawal`
      };

      const response = await axios.post(
        `${this.config.flooz.apiUrl}/withdraw`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.config.flooz.apiKey
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        return {
          status: 'PROCESSING',
          externalRef: response.data.transaction_id
        };
      } else {
        throw new Error(`FLOOZ Withdrawal Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Erreur retrait FLOOZ:', error.response?.data || error.message);
      throw new Error(`Échec du retrait FLOOZ: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(externalRef, provider) {
    try {
      let response;
      
      switch (provider) {
        case 'YAS':
          response = await axios.get(
            `${this.config.yas.apiUrl}/payment/status/${externalRef}`,
            {
              headers: {
                'Authorization': `Bearer ${this.config.yas.apiKey}`
              }
            }
          );
          return {
            status: response.data.status,
            amount: response.data.amount,
            fees: response.data.fees || 0
          };

        case 'FLOOZ':
          response = await axios.get(
            `${this.config.flooz.apiUrl}/transaction/${externalRef}`,
            {
              headers: {
                'Authorization': this.config.flooz.apiKey
              }
            }
          );
          return {
            status: response.data.status,
            amount: response.data.amount,
            fees: response.data.fees || 0
          };

        case 'PI_SPI_BCEAO':
          response = await axios.get(
            `${this.config.bceao.apiUrl}/payment/status`,
            {
              params: { paymentToken: externalRef },
              headers: {
                'Authorization': `Bearer ${this.config.bceao.apiKey}`
              }
            }
          );
          return {
            status: response.data.paymentStatus,
            amount: response.data.amount,
            fees: response.data.fees || 0
          };

        default:
          throw new Error(`Provider inconnu: ${provider}`);
      }
    } catch (error) {
      console.error(`Erreur vérification statut ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Calculer les frais de transaction
   */
  calculateFees(amount, paymentMethod) {
    const feeRates = {
      YAS: 0.02,        // 2%
      FLOOZ: 0.02,      // 2%
      VISA: 0.025,      // 2.5%
      MASTERCARD: 0.025, // 2.5%
      PI_SPI_BCEAO: 0.01, // 1%
      WALLET: 0         // Gratuit pour transferts wallet
    };

    const rate = feeRates[paymentMethod] || 0.02;
    return Math.round(amount * rate);
  }

  /**
   * Valider une signature de webhook
   */
  validateWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

module.exports = new PaymentService();