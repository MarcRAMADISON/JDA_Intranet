import Cookies from 'js-cookie';

export const setAuthCookie = ({cookies}:{cookies:string}) => {
  Cookies.set('auth-token', cookies, {
    expires: 1, // Durée en jours
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

