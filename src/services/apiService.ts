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

export interface ReviewerNotificationPayload {
  correlationId: string;
  requestedBy: {
    email: string;
    name: string;
  };
  requestedFor: {
    email: string;
    name: string;
  };
  reviewers: Array<{
    email: string;
    name: string;
  }>;
  attempt: number;
  applicationLink: string;
  endDate: string;
}

export interface MarkReviewerFilledPayload {
  correlationId: string;
  requestedBy: {
    email: string;
    name: string;
  };
  reviewer: {
    email: string;
    name: string;
  };
  talent: {
    email: string;
    name: string;
  };
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
  
  async sendToReviewer(payload: ReviewerNotificationPayload, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_TO_REVIEWER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send feedback forms to Reviewers');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Reviewer notification error:', error);
      throw error;
    }
  }

  async markReviewerFilled(payload: MarkReviewerFilledPayload, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARK_REVIEWER_FILLED}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark reviewer as having submitted feedback');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Mark reviewer filled error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
