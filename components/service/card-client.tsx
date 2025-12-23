'use client';

import type {ServiceCard} from '@/types/service';
import {ServiceCardComponent} from './card';

interface EnhancedServiceCardType extends ServiceCard {
  averageRating: number;
}
export default function ServiceCards({services}: {services: EnhancedServiceCardType[]}) {
  return services.map(s => <ServiceCardComponent key={s.id} service={s} />);
}
