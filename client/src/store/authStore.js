import { create } from 'zustand';

const getUserFromToken = (token) => {
  try {
    return JSON.parse(
      atob(token.split('.')[1])
    );
  } catch {
    return null;
  }
};

const storedToken =
  localStorage.getItem('pp_token');

const storedTheme =
  localStorage.getItem('pp_theme')
  || 'dark';

export const useAuthStore =
create((set) => ({

  token: storedToken,

  user:
    storedToken
      ? getUserFromToken(
          storedToken
        )
      : null,

  theme:
    storedTheme,

  setToken:
    (token) => {

      localStorage.setItem(
        'pp_token',
        token
      );

      set({
        token,
        user:
          getUserFromToken(
            token
          )
      });
    },

  setTheme:
    (theme) => {

      localStorage.setItem(
        'pp_theme',
        theme
      );

      set({
        theme
      });
    },

  logout:
    () => {

      localStorage.removeItem(
        'pp_token'
      );

      localStorage.removeItem(
        'pp_tab'
      );

      // preserve theme
      set({
        token:null,
        user:null
      });
    }

}));