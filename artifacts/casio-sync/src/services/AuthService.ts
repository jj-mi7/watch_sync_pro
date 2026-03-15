import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import type { User } from '../types';

export const AuthService = {
  configure: () => {
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
      offlineAccess: true,
    });
  },

  signInWithGoogle: async (): Promise<User | null> => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const googleUser = response.data?.user;
      if (!googleUser) return null;
      return {
        id: googleUser.id ?? '',
        email: googleUser.email ?? '',
        name: googleUser.name ?? '',
        photoUrl: googleUser.photo ?? undefined,
        idToken: response.data?.idToken ?? undefined,
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return null;
      }
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await GoogleSignin.signOut();
    } catch {}
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await GoogleSignin.getCurrentUser();
      const googleUser = response?.user;
      if (!googleUser) return null;
      return {
        id: googleUser.id ?? '',
        email: googleUser.email ?? '',
        name: googleUser.name ?? '',
        photoUrl: googleUser.photo ?? undefined,
      };
    } catch {
      return null;
    }
  },

  isSignedIn: async (): Promise<boolean> => {
    return GoogleSignin.hasPreviousSignIn();
  },
};
