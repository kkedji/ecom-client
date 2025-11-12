const axios = require('axios');

class SMSService {
  constructor() {
    this.providers = {
      togocel: {
        url: process.env.TOGOCEL_API_URL,
        apiKey: process.env.TOGOCEL_API_KEY,
        shortCode: process.env.TOGOCEL_SHORT_CODE
      },
      moov: {
        url: process.env.MOOV_API_URL,
        apiKey: process.env.MOOV_API_KEY,
        shortCode: process.env.MOOV_SHORT_CODE
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
      }
    };
  }

  /**
   * Détermine le meilleur fournisseur SMS basé sur le numéro de téléphone
   */
  getBestProvider(phoneNumber) {
    // Extraire l'indicatif réseau du numéro togolais
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    if (cleanNumber.length >= 11) {
      const networkCode = cleanNumber.substr(-8, 2); // Les 2 premiers chiffres après 228
      
      // Codes réseau Togo
      // Togocel: 90, 91, 92, 93
      // Moov: 96, 97, 98, 99, 70, 71, 72, 79
      
      if (['90', '91', '92', '93'].includes(networkCode)) {
        return 'togocel';
      } else if (['96', '97', '98', '99', '70', '71', '72', '79'].includes(networkCode)) {
        return 'moov';
      }
    }
    
    // Par défaut, utiliser Togocel
    return 'togocel';
  }

  /**
   * Envoyer SMS via Togocel
   */
  async sendViaTogocel(phoneNumber, message) {
    try {
      const response = await axios.post(
        `${this.providers.togocel.url}/send`,
        {
          from: this.providers.togocel.shortCode,
          to: phoneNumber,
          message: message,
          api_key: this.providers.togocel.apiKey
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          provider: 'togocel',
          messageId: response.data.message_id,
          cost: response.data.cost || 0
        };
      } else {
        throw new Error(`Togocel API Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Erreur Togocel SMS:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envoyer SMS via Moov
   */
  async sendViaMoov(phoneNumber, message) {
    try {
      const response = await axios.post(
        `${this.providers.moov.url}/sms/send`,
        {
          sender: this.providers.moov.shortCode,
          recipient: phoneNumber,
          content: message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.moov.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        return {
          success: true,
          provider: 'moov',
          messageId: response.data.reference,
          cost: response.data.cost || 0
        };
      } else {
        throw new Error(`Moov API Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Erreur Moov SMS:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envoyer SMS via Twilio (fallback international)
   */
  async sendViaTwilio(phoneNumber, message) {
    try {
      const twilio = require('twilio')(
        this.providers.twilio.accountSid,
        this.providers.twilio.authToken
      );

      const response = await twilio.messages.create({
        body: message,
        from: this.providers.twilio.phoneNumber,
        to: phoneNumber
      });

      return {
        success: true,
        provider: 'twilio',
        messageId: response.sid,
        cost: response.price || 0
      };
    } catch (error) {
      console.error('Erreur Twilio SMS:', error);
      throw error;
    }
  }

  /**
   * Méthode principale pour envoyer un SMS
   */
  async sendSMS(phoneNumber, message, forceProvider = null) {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Valider le numéro de téléphone togolais
    if (!cleanPhone.match(/^\+228[0-9]{8}$/)) {
      throw new Error('Numéro de téléphone invalide pour le Togo');
    }

    // Déterminer le fournisseur à utiliser
    const preferredProvider = forceProvider || this.getBestProvider(cleanPhone);
    
    console.log(`Envoi SMS via ${preferredProvider} vers ${cleanPhone}`);

    try {
      let result;

      switch (preferredProvider) {
        case 'togocel':
          if (!this.providers.togocel.apiKey) {
            throw new Error('Configuration Togocel manquante');
          }
          result = await this.sendViaTogocel(cleanPhone, message);
          break;

        case 'moov':
          if (!this.providers.moov.apiKey) {
            throw new Error('Configuration Moov manquante');
          }
          result = await this.sendViaMoov(cleanPhone, message);
          break;

        case 'twilio':
          if (!this.providers.twilio.accountSid) {
            throw new Error('Configuration Twilio manquante');
          }
          result = await this.sendViaTwilio(cleanPhone, message);
          break;

        default:
          throw new Error(`Fournisseur SMS inconnu: ${preferredProvider}`);
      }

      // Logger le succès
      console.log(`SMS envoyé avec succès:`, {
        provider: result.provider,
        messageId: result.messageId,
        phoneNumber: cleanPhone,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      console.error(`Échec envoi SMS via ${preferredProvider}:`, error.message);
      
      // Tentative de fallback si le provider principal échoue
      if (preferredProvider !== 'twilio' && this.providers.twilio.accountSid) {
        console.log('Tentative de fallback via Twilio...');
        try {
          return await this.sendViaTwilio(cleanPhone, message);
        } catch (fallbackError) {
          console.error('Échec du fallback Twilio:', fallbackError.message);
        }
      }

      // Si tous les providers échouent
      throw new Error(`Impossible d'envoyer le SMS: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un SMS envoyé
   */
  async checkSMSStatus(messageId, provider) {
    try {
      switch (provider) {
        case 'togocel':
          const togocelResponse = await axios.get(
            `${this.providers.togocel.url}/status/${messageId}`,
            {
              headers: {
                'Authorization': `Bearer ${this.providers.togocel.apiKey}`
              }
            }
          );
          return togocelResponse.data;

        case 'moov':
          const moovResponse = await axios.get(
            `${this.providers.moov.url}/sms/status/${messageId}`,
            {
              headers: {
                'Authorization': `Bearer ${this.providers.moov.apiKey}`
              }
            }
          );
          return moovResponse.data;

        case 'twilio':
          const twilio = require('twilio')(
            this.providers.twilio.accountSid,
            this.providers.twilio.authToken
          );
          const message = await twilio.messages(messageId).fetch();
          return {
            status: message.status,
            dateUpdated: message.dateUpdated
          };

        default:
          throw new Error(`Provider inconnu pour vérification: ${provider}`);
      }
    } catch (error) {
      console.error(`Erreur vérification statut SMS:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'envoi SMS
   */
  async getSMSStats(startDate, endDate) {
    // Cette méthode devrait être implémentée pour récupérer
    // les statistiques depuis une base de données ou les APIs des providers
    return {
      total: 0,
      success: 0,
      failed: 0,
      cost: 0,
      providers: {
        togocel: { count: 0, cost: 0 },
        moov: { count: 0, cost: 0 },
        twilio: { count: 0, cost: 0 }
      }
    };
  }
}

// Export singleton
module.exports = new SMSService();