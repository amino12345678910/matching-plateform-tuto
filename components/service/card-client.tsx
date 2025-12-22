'use client';

import type {ServiceCard} from '@/types/service';
import {ServiceCardComponent} from './card';

interface Props {
  services: ServiceCard[];
}

export default function ServiceCards({services}: Props) {
  return services.map(s => <ServiceCardComponent key={s.id} service={s} />);
}
