import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
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

const usernameFromPayload = (name: string | undefined, email: string): string => {
  if (name && name.trim().length > 0) return name.trim();
  return email.split('@')[0];
};

const loginWithGoogle = async (credential: string): Promise<UserDto> => {
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

  const byGoogleId = await userRepository.getByGoogleId(googleId);
  if (byGoogleId) return toDto(byGoogleId);

  const byEmail = await userRepository.getByEmail(email);
  if (byEmail) {
    await userRepository.linkGoogleId(byEmail.id, googleId);
    const refreshed = await userRepository.getById(byEmail.id);
    return toDto(refreshed);
  }

  const created = await userRepository.createGoogleUser({
    googleId,
    email,
    username,
    profilePictureUrl: picture,
  });
  const withRelations = await userRepository.getById(created.id);
  return toDto(withRelations);
};

type RegisterInput = { username: string; email: string; password: string };
type LoginInput = { identifier: string; password: string };

const register = async (input: RegisterInput): Promise<UserDto> => {
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
  const withRelations = await userRepository.getById(created.id);
  return toDto(withRelations);
};

const login = async (input: LoginInput): Promise<UserDto> => {
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

  return toDto(user);
};

export const authService = {
  loginWithGoogle,
  register,
  login,
};
