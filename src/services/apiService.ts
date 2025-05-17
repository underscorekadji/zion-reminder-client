import { API_CONFIG } from '../config/api.config';
import type { TokenResponse } from './tokenService';

export interface TmNotificationPayload {
  correlationId: string;
  talentManager: {
    email: string;
    name: string;
  };
  talent: {
    email: string;
    name: string;
  };
  by: {
    email: string;
    name: string;
  };
  applicationLink: string;
  startDate: string;
  endDate: string;
}

class ApiService {
  async getAuthToken(): Promise<TokenResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch authentication token');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async sendToTalentMentor(payload: TmNotificationPayload, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_TO_TM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification to Talent Mentor');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Notification error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
