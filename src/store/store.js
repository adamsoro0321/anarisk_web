import create from 'zustand';
import { persist } from 'zustand/middleware';
import { appString } from '../constant/constant';

const useUserStore = create(
  persist((set) => ({
    user:null,//null,
    token: null,
    isAuth:false,//false
    updateUser: (newUser) => set({ user: newUser }),
    updateToken: (newToken) => set({ token: newToken }),
    updateAuth:(boolean)=>set({isAuth:boolean}),
    updateAll:(newuser,newToken,b)=>set({user:newuser,token:newToken,isAuth:b}),
    logout: () => set({ user: null, token: null, isAuth: false })
  }), {
    name: appString.USER_LOCAL_STORE, // Nom du magasin pour le stockage local
   getStorage: () => localStorage, // Stockage local ou de session
  })
);

export default useUserStore;
