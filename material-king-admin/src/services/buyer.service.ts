import { apiService } from './api.service';
import { Buyer, Project } from '../types';
import { API_CONFIG } from '../config/api.config';
import axios from 'axios';

export const buyerService = {
  async getAll(): Promise<Buyer[]> {
    return apiService.getAll<Buyer>('/buyers');
  },

  async create(data: any): Promise<Buyer> {
    return apiService.create<Buyer>('/buyers', data);
  },

  async update(id: string, data: any): Promise<Buyer> {
    return apiService.update<Buyer>('/buyers', id, data);
  },

  async delete(id: string): Promise<void> {
    return apiService.delete('/buyers', id);
  },

  async getProjects(buyerId: string): Promise<Project[]> {
    const response = await axios.get(`${API_CONFIG.API_BASE_URL}/buyers/${buyerId}/projects`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('mk_auth_token')}`,
      },
    });
    return response.data;
  },
};
