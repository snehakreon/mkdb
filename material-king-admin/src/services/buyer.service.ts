import { apiService } from './api.service';
import { Buyer, Project } from '../types';
import { API_CONFIG } from '../config/api.config';
import axios from 'axios';

const MOCK_BUYERS: Buyer[] = [
  {
    id: '1', company_name: 'ABC Builders', gstin: '27AAACR5678C1Z9',
    company_type: 'Builder', is_active: true, first_name: 'Raj', last_name: 'Patel',
    email: 'raj@abc.com', phone: '9876543210'
  },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', project_name: 'Project Alpha', project_code: 'PRJ-001',
    delivery_address: '123 Main St, Mumbai', delivery_pincode: '400001',
    delivery_city: 'Mumbai', delivery_state: 'Maharashtra',
    site_manager_name: 'Ramesh', site_manager_phone: '9876543211',
    is_active: true
  },
];

export const buyerService = {
  async getAll(): Promise<Buyer[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Buyer>('/buyers');
    }
    return Promise.resolve(MOCK_BUYERS);
  },

  async getProjects(buyerId: string): Promise<Project[]> {
    if (API_CONFIG.USE_REAL_API) {
      const response = await axios.get(`${API_CONFIG.API_BASE_URL}/buyers/${buyerId}/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('mk_auth_token')}`,
        },
      });
      return response.data;
    }
    return Promise.resolve(MOCK_PROJECTS);
  },
};
