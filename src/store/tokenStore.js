import { create } from 'zustand'

const useTokenStore = create((set) => ({
 Gtoken: {}, /**g forglobal or genenral */
  upDateGToken: (token) => set((state) => ({ Gtoken: token })),
}))

export default useTokenStore;