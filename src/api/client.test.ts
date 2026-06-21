import { apiClient } from './client';

describe('apiClient request interceptor', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('attaches the bearer token from local storage', async () => {
    localStorage.setItem('tapro_token', 'jwt-token');
    localStorage.setItem('tapro_user', JSON.stringify({ restaurantId: 7 }));

    const interceptor = apiClient.interceptors.request.handlers?.[0];
    expect(interceptor?.fulfilled).toBeDefined();

    const config = await interceptor!.fulfilled!({ headers: {} as any });

    expect(config.headers.Authorization).toBe('Bearer jwt-token');
    expect(config.headers['X-Tenant-ID']).toBe('7');
  });
});
