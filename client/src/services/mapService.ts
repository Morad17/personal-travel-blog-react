import { api } from './api';
import type { MapCountry } from '../types';

export const mapService = {
  getVisited() {
    return api.get<MapCountry[]>('/map/visited');
  },
};
