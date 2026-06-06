import { OAuth2Client } from 'google-auth-library';
import { UserDto } from '../dtos';
import { UnauthorizedException } from '../exceptions';
import { userRepository } from '../repositories';

const clientId = process.env.GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(clientId);

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

export const authService = {
  loginWithGoogle,
};
