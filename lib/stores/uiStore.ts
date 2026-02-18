import { create } from 'zustand'

interface UIStore {
  isSidebarCollapsed: boolean
  isMobileMenuOpen: boolean
  activeModal: string | null
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  openModal: (modal: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}))
