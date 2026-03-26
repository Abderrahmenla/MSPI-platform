import { ConfigService } from '@nestjs/config';

import { FacebookStrategy } from './facebook.strategy';
import { AuthService } from '../auth.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  uuid: 'user-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice Dupont',
  email: 'alice@example.com',
};

const buildAuthServiceMock = () => ({
  validateFacebookUser: jest.fn(),
});

const buildConfigMock = () => ({
  getOrThrow: jest.fn((key: string) => {
    const map: Record<string, string> = {
      FACEBOOK_APP_ID: 'test-app-id',
      FACEBOOK_APP_SECRET: 'test-app-secret',
      FACEBOOK_CALLBACK_URL:
        'http://localhost:4000/api/v1/auth/facebook/callback',
    };
    if (!(key in map)) throw new Error(`Missing env: ${key}`);
    return map[key];
  }),
  get: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FacebookStrategy', () => {
  let strategy: FacebookStrategy;
  let authService: ReturnType<typeof buildAuthServiceMock>;

  beforeEach(() => {
    authService = buildAuthServiceMock();
    strategy = new FacebookStrategy(
      authService as unknown as AuthService,
      buildConfigMock() as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls validateFacebookUser with normalized profile data', async () => {
    authService.validateFacebookUser.mockResolvedValue(mockUser);

    const profile = {
      id: 'fb-123',
      displayName: 'Alice Dupont',
      emails: [{ value: 'alice@example.com' }],
    };

    const result = await strategy.validate(
      'access-token',
      'refresh-token',
      profile as never,
    );

    expect(authService.validateFacebookUser).toHaveBeenCalledWith({
      id: 'fb-123',
      displayName: 'Alice Dupont',
      emails: [{ value: 'alice@example.com' }],
    });
    expect(result).toEqual(mockUser);
  });

  it('propagates errors from AuthService', async () => {
    authService.validateFacebookUser.mockRejectedValue(new Error('DB error'));

    const profile = {
      id: 'fb-123',
      displayName: 'Alice',
      emails: [],
    };

    await expect(
      strategy.validate('access-token', 'refresh-token', profile as never),
    ).rejects.toThrow('DB error');
  });
});
