import ky from 'ky';
import Cookies from 'js-cookie';

// Если токен в куки есть - true, иначе false
export const hasTokenInCookies = () => {

  if (DEBUG_MODE_WITHOUT_AUTH) {
    return true;
  }

  const token = Cookies.get(globalThis.FAIRWATT_ACCESS_TOKEN_NAME);
  return token !== undefined; // Если токен есть, возвращает true
};

// Удалить токен из куки. Если получилось - true, иначе false
export const removeTokenFromCookies = () => {
  try {
    Cookies.remove(globalThis.FAIRWATT_ACCESS_TOKEN_NAME);
    return true;
  } catch (error) {
    return false;
  }
};

// Внести токен в куки.
export const setTokenInCookies = (token: string) => {
  try {
    Cookies.set(globalThis.FAIRWATT_ACCESS_TOKEN_NAME, token);
    return true;
  } catch (error) {
    return false;
  }
};