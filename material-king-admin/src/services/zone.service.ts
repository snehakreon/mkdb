import { apiService, PaginatedResult } from './api.service';
import { Zone } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_ZONES: Zone[] = [
  { id: '1', code: 'ZONE-MUM-N', name: 'Mumbai North', is_active: true },
  { id: '2', code: 'ZONE-MUM-S', name: 'Mumbai South', is_active: true },
  { id: '3', code: 'ZONE-DEL-E', name: 'Delhi NCR East', is_active: true },
];

export const zoneService = {
  async getAll(): Promise<Zone[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Zone>('/zones');
    }
    return Promise.resolve(MOCK_ZONES);
  },

  async getPaginated(page = 1, pageSize = 20, search = ''): Promise<PaginatedResult<Zone>> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getPaginated<Zone>('/zones', { page, pageSize, ...(search && { search }) });
    }
    return { data: MOCK_ZONES, pagination: { page: 1, pageSize: 20, total: MOCK_ZONES.length, totalPages: 1 } };
  },

  async getById(id: string): Promise<Zone> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getById<Zone>('/zones', id);
    }
    const zone = MOCK_ZONES.find(z => z.id === id);
    return Promise.resolve(zone!);
  },

  async create(data: Partial<Zone>): Promise<Zone> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Zone>('/zones', data);
    }
    const newZone = { ...data, id: String(Date.now()), is_active: true } as Zone;
    return Promise.resolve(newZone);
  },

  async update(id: string, data: Partial<Zone>): Promise<Zone> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<Zone>('/zones', id, data);
    }
    return Promise.resolve({ ...data, id } as Zone);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/zones', id);
    }
    return Promise.resolve();
  },
};
