import { apiService } from './api.service';
import { Zone } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_ZONES: Zone[] = [
  { id: '1', zone_code: 'ZONE-MUM-N', zone_name: 'Mumbai North', is_active: true, pincodes: ['400001', '400002', '400003'] },
  { id: '2', zone_code: 'ZONE-MUM-S', zone_name: 'Mumbai South', is_active: true, pincodes: ['400051', '400052'] },
  { id: '3', zone_code: 'ZONE-DEL-E', zone_name: 'Delhi NCR East', is_active: true, pincodes: ['110001', '110002'] },
];

export const zoneService = {
  async getAll(): Promise<Zone[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Zone>('/zones');
    }
    return Promise.resolve(MOCK_ZONES);
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
