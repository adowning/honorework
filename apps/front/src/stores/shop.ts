import type { IShop, IUser, IGame, IProduct } from '@/sdk/_types/src/prisma/interfaces.ts'
import { defineStore } from 'pinia'
import { store } from './index.ts'
import type { SpinData } from '@/sdk/_types/src/prisma/types.ts'

export const useShopStore = defineStore(
  'shop',
  () => {
    //   const { api } = useRequest()
    const currentShop = ref<IShop>()
    const userList = ref<Partial<IUser[]>>([])
    const gameList = ref<IGame[]>([])
    const spinDatas = ref<SpinData[]>([])
    const bigWins = ref<any[]>([])
    const products = ref<IProduct[]>([])
    const setBigWins = () => {
      const wins: any[] = []
      spinDatas.value.forEach((bet: SpinData) => {
        let game = gameList.value.find((game) => game.title.replace(/\s+/g, '') == bet.gameId)
        console.log(bet)
        // developer = developer.developer
        if (game !== undefined) {
          bet.developer = game.developer
          bet.gameId = game.name.toLowerCase()
        }
        // if (bet.gameId.includes('NLC')) {
        //   bet.developer = 'nolimit'
        //   bet.gameId = bet.gameId.toLowerCase()
        // }
        // if (bet.gameId.includes('RTG')) {
        //   bet.developer = 'redtiger'
        //   bet.gameId = bet.gameId.toLowerCase()
        // }
        // if (bet.gameId.includes('NET')) {
        //   bet.developer = 'netent'
        //   bet.gameId = bet.gameId.toLowerCase()
        // }
        // if (bet.gameId.includes('NG')) {
        //   bet.developer = 'netgame'
        //   bet.gameId = bet.gameId.toLowerCase()
        // }
        // if (bet.gameId.includes('KA')) {
        //   bet.developer = 'kickass'
        //   bet.gameId = bet.gameId.toLowerCase()
        // }
        if (bet.amount > 0) {
          const user = userList.value.find((u: any) => u.activeProfileId === bet.profileId)
          if (user === undefined) return
          console.log(user.avatar)
          bet.username = user.username
          bet.avatar = user.avatar
          wins.push(bet)
        }
      })
      bigWins.value = wins
    }
    const setShop = (shopInfo: IShop) => {
      currentShop.value = shopInfo
    }

    const setUsers = (list: Partial<IUser[]>) => {
      userList.value = list
    }
    const setSpinDatas = (bets: any[]) => {
      spinDatas.value = bets
    }

    function groupGames(games: IGame[]) {
      // Separate games into featured and non-featured lists
      const featuredGames = games.filter((game) => game.featured)
      const nonFeaturedGames = games.filter((game) => !game.featured)

      const numberOfGroups = featuredGames.length

      // If there are no featured games, return the original array
      if (numberOfGroups === 0) {
        console.warn('No featured games found. Returning the original array.')
        return games
      }

      const totalNonFeaturedGames = nonFeaturedGames.length
      // Base number of non-featured games per group (integer division)
      const baseGamesPerGroup = Math.floor(totalNonFeaturedGames / numberOfGroups)
      // Number of groups that will receive one extra non-featured game
      const remainder = totalNonFeaturedGames % numberOfGroups

      // Create a single array to hold the flattened result
      const flattenedGroups = []

      let nonFeaturedIndex = 0
      for (let i = 0; i < numberOfGroups; i++) {
        // Add the current featured game to the result array
        flattenedGroups.push(featuredGames[i])

        // Determine how many non-featured games this group should get
        const gamesForThisGroup = baseGamesPerGroup + (i < remainder ? 1 : 0)

        // Add the allocated non-featured games to the result array
        for (let j = 0; j < gamesForThisGroup; j++) {
          if (nonFeaturedIndex < totalNonFeaturedGames) {
            flattenedGroups.push(nonFeaturedGames[nonFeaturedIndex])
            nonFeaturedIndex++
          } else {
            // Should not happen if calculations are correct, but good safeguard
            break
          }
        }
      }

      // Add any remaining non-featured games if the distribution didn't use them all
      // This could happen if the number of non-featured games is less than the number of featured games
      while (nonFeaturedIndex < totalNonFeaturedGames) {
        flattenedGroups.push(nonFeaturedGames[nonFeaturedIndex])
        nonFeaturedIndex++
      }

      // Return the single flattened array
      return flattenedGroups
    }
    const setGames = (allGames: IGame[]) => {
      let x = 0
      // function groupGames(games) {
      // Separate games into featured and non-featured lists
      const totalGamesCount = allGames.length
      const hotCount = Math.floor(totalGamesCount / 5)
      const coldCount = Math.floor(totalGamesCount / 5)

      let currentHot = 0
      let currentCold = 0

      // Shuffle the array to ensure random distribution
      // Fisher-Yates (Knuth) Shuffle Algorithm
      for (let i = allGames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allGames[i], allGames[j]] = [allGames[j], allGames[i]] // Swap elements
      }

      allGames.forEach((game) => {
        // Default temperature is 'none'
        game.temperature = 'none'

        // Randomly assign 'hot' or 'cold' based on counts
        const randomValue = Math.random() // Value between 0 (inclusive) and 1 (exclusive)

        if (currentHot < hotCount && randomValue < 0.5) {
          // Simple split probability
          game.temperature = 'hot'
          currentHot++
        } else if (currentCold < coldCount) {
          // Assign cold if not hot and cold count not reached
          game.temperature = 'cold'
          currentCold++
        }
        // If neither condition is met, temperature remains 'none'
      })

      // Shuffle again to mix games with temperatures back into a somewhat random order
      // before grouping, while preserving the assigned temperatures.
      for (let i = allGames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allGames[i], allGames[j]] = [allGames[j], allGames[i]] // Swap elements
      }
      // --- END ADDED ---

      console.log('Original Games Array (with Temperature):')
      console.log(allGames)

      const groupedResult = groupGames(allGames)

      console.log('\nGrouped Games Result (Flattened):')
      console.log(groupedResult)

      gameList.value = groupedResult
    }
    return {
      products,
      setUsers,
      setShop,
      bigWins,
      setBigWins,
      setGames,
      setSpinDatas,
      currentShop,
      gameList,
    }
  },
  {
    persist: {
      pick: ['gameList', 'products', 'currentShop'],
    },
  },
)

export function useShopStoreOutside() {
  return useShopStore(store)
}
