import type {ServiceForm} from '@/types/service';

export async function addService(data: ServiceForm) {
  const res = await fetch('/api/services/submit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to add service');
  }
  console.log('Response from addService :', res.json());
  return res.json();
}
