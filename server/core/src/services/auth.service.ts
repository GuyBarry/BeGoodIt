import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';
import { UserDto } from '../dtos';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '../exceptions';
import { userRepository } from '../repositories';

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const oauthClient = new OAuth2Client(clientId);
const BCRYPT_ROUNDS = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

export type Tokens = { token: string; refreshToken: string };
export type AuthResult = Tokens & { user: UserDto };

const toDto = (user: Awaited<ReturnType<typeof userRepository.getById>>): UserDto => {
  if (!user) throw new UnauthorizedException('User not found');
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    gender: user.gender,
    birthdate: user.birthdate,
    heightCm: user.heightCm,
    bodyType: user.bodyType,
    createdAt: user.createdAt,
  };
};

// Sign a short-lived access token and a long-lived refresh token for a user.
const generateTokens = (userId: string): Tokens => {
  const token = jwt.sign({ userId }, authConfig.jwtSecret, {
    expiresIn: authConfig.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ userId }, authConfig.jwtSecret, {
    expiresIn: authConfig.refreshExpiresIn,
  });
  return { token, refreshToken };
};

// Issue a fresh token pair for a user, persisting the refresh token so it can
// later be validated (and rotated) at the /auth/refresh endpoint.
const issueTokens = async (userId: string): Promise<Tokens> => {
  const tokens = generateTokens(userId);
  await userRepository.addRefreshToken(userId, tokens.refreshToken);
  return tokens;
};

const usernameFromPayload = (name: string | undefined, email: string): string => {
  if (name && name.trim().length > 0) return name.trim();
  return email.split('@')[0];
};

const loginWithGoogle = async (credential: string): Promise<AuthResult> => {
  if (!clientId) {
    throw new UnauthorizedException(
      'Google auth not configured: missing GOOGLE_CLIENT_ID',
    );
  }

  let payload;
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new UnauthorizedException('Invalid Google credential');
  }

  if (!payload || !payload.sub || !payload.email) {
    throw new UnauthorizedException('Invalid Google credential payload');
  }
  if (payload.email_verified === false) {
    throw new UnauthorizedException('Google email not verified');
  }

  const googleId = payload.sub;
  const email = payload.email;
  const picture = payload.picture ?? null;
  const username = usernameFromPayload(payload.name, email);

  const resolveUserId = async (): Promise<string> => {
    const byGoogleId = await userRepository.getByGoogleId(googleId);
    if (byGoogleId) return byGoogleId.id;

    const byEmail = await userRepository.getByEmail(email);
    if (byEmail) {
      await userRepository.linkGoogleId(byEmail.id, googleId);
      return byEmail.id;
    }

    const created = await userRepository.createGoogleUser({
      googleId,
      email,
      username,
      profilePictureUrl: picture,
    });
    return created.id;
  };

  const userId = await resolveUserId();
  const tokens = await issueTokens(userId);
  const withRelations = await userRepository.getById(userId);
  return { user: toDto(withRelations), ...tokens };
};

type RegisterInput = { username: string; email: string; password: string };
type LoginInput = { identifier: string; password: string };

const register = async (input: RegisterInput): Promise<AuthResult> => {
  const username = input.username?.trim() ?? '';
  const email = input.email?.trim().toLowerCase() ?? '';
  const password = input.password ?? '';

  if (!USERNAME_RE.test(username)) {
    throw new BadRequestException(
      'Username must be 3-32 characters and may contain letters, numbers, dot, dash, or underscore',
    );
  }
  if (!EMAIL_RE.test(email)) {
    throw new BadRequestException('Please provide a valid email address');
  }
  if (password.length < 8) {
    throw new BadRequestException('Password must be at least 8 characters long');
  }

  const [existingByEmail, existingByUsername] = await Promise.all([
    userRepository.getByEmail(email),
    userRepository.getByUsername(username),
  ]);
  if (existingByEmail) {
    throw new ConflictException('An account with this email already exists');
  }
  if (existingByUsername) {
    throw new ConflictException('This username is already taken');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await userRepository.createPasswordUser({
    username,
    email,
    passwordHash,
  });
  const tokens = await issueTokens(created.id);
  const withRelations = await userRepository.getById(created.id);
  return { user: toDto(withRelations), ...tokens };
};

const login = async (input: LoginInput): Promise<AuthResult> => {
  const identifier = input.identifier?.trim() ?? '';
  const password = input.password ?? '';

  if (!identifier || !password) {
    throw new BadRequestException('Email/username and password are required');
  }

  const lookup = identifier.includes('@')
    ? userRepository.getByEmail(identifier.toLowerCase())
    : userRepository.getByUsername(identifier);
  const user = await lookup;

  if (!user || !user.passwordHash) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const tokens = await issueTokens(user.id);
  return { user: toDto(user), ...tokens };
};

// Validate a refresh token, rotate it, and hand back a fresh token pair.
const refresh = async (refreshToken: string): Promise<Tokens> => {
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(refreshToken, authConfig.jwtSecret) as { userId: string };
  } catch {
    throw new UnauthorizedException('Invalid refresh token');
  }

  const user = await userRepository.getById(decoded.userId);
  if (!user) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  // If the token isn't among the stored ones it may have been leaked/reused —
  // drop every refresh token for this user, forcing a fresh login.
  if (!(user.refreshTokens ?? []).includes(refreshToken)) {
    await userRepository.clearRefreshTokens(user.id);
    throw new UnauthorizedException('Invalid refresh token');
  }

  const tokens = generateTokens(user.id);
  await userRepository.replaceRefreshToken(user.id, refreshToken, tokens.refreshToken);
  return tokens;
};

export const authService = {
  loginWithGoogle,
  register,
  login,
  refresh,
};
