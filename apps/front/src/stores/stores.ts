// Utilities
import { createPinia } from 'pinia'
// Import stores using the new setup syntax naming convention
import { useAboutStore } from './about'
import { useAchievementStore } from './achievement'
import { useAgentStore } from './agent'
import { useGameStore } from './game'
import { useHomeStore } from './home' // Assuming you also have a home store
import { useInviteStore } from './invite' // Assuming you have an invite store
import { useLoginBonusStore } from './loginBonus' // Assuming you have a loginBonus store
import { useMailStore } from './mail' // Assuming you have a mail store
import { useMainStore } from './main' // Assuming you have a main store
import { useMenuStore } from './menu' // Assuming you have a menu store
import { usePromoStore } from './promo' // Assuming you have a promo store
import { useRefferalStore } from './refferal' // Assuming you have a refferal store

const pinia = createPinia()

export function resetAllStores() {
  // Call the use...Store hooks to get the store instances
  const stores = [
    useAboutStore(pinia),
    useAchievementStore(pinia),
    useAgentStore(pinia),
    useGameStore(pinia),
    useHomeStore(pinia),
    useInviteStore(pinia),
    useLoginBonusStore(pinia),
    useMailStore(pinia),
    useMainStore(pinia),
    useMenuStore(pinia),
    usePromoStore(pinia),
    useRefferalStore(pinia),
  ] // Add more stores as needed

  stores.forEach((instance) => {
    // Check if the store instance has a $reset method (setup stores don't have it by default)
    // If you need $reset functionality in setup stores, you need to manually add it.
    // For now, we'll just log the state as the original code did.
    console.log(instance) // Log the instance instead of $state as $state is not directly available
    // If you implement $reset in your setup stores, you can uncomment the line below
    // instance.$reset();
  })
}

export default pinia // Export the pinia instance
