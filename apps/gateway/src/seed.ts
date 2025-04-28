import { eq } from 'drizzle-orm'
import { db } from './db'
import { user, operator, bank, profile } from './drizzle/schema'

export async function seedDatabase() {
  // Create owner user
  const ownerId = 'user_owner'
  const operatorId = 'operator_1'
  const bankId = 'bank_1'

  type NewUser = typeof user.$inferInsert

  const insertUser = async (_user: NewUser) => {
    return db.insert(user).values(_user)
  }
  await db.delete(bank).where(eq(bank.id, bankId)).execute()
  await db.delete(operator).where(eq(operator.id, operatorId)).execute()
  await db.delete(user).where(eq(user.id, ownerId)).execute()
  await insertUser({
    id: ownerId,
    username: 'platform_owner',
    email: 'owner@operator.com',
    passwordHash: await Bun.password.hash('hashed_password_placeholder'),
    updatedAt: new Date().toISOString(),
  })

  const _operator = await db
    .insert(operator)
    .values({
      id: operatorId,
      name: 'Prime Casino Operator',
      slug: 'prime-casino',
      ownerId: ownerId,
      updatedAt: new Date().toISOString(),
    })
    .returning()

  // Create bank
  // const bankId = 'bank_1'
  await db.delete(bank).where(eq(bank.id, bankId)).execute()
  await db.insert(bank).values({
    id: bankId,
    name: 'Prime Casino Bank',
    operatorId: operatorId,
  })

  for (let i = 1; i <= 10; i++) {
    const userId = `user_${i}`
    await db.delete(user).where(eq(user.id, userId)).execute()

    const argonHash = await Bun.password.hash('hashed_password_placeholder', {
      algorithm: 'argon2id', // "argon2id" | "argon2i" | "argon2d"
      memoryCost: 4, // memory usage in kibibytes
      timeCost: 3, // the number of iterations
    })
    // Create user
    await insertUser({
      id: userId,
      username: `player_${i}`,
      email: `player_${i}@gaming.com`,
      passwordHash: argonHash,
      updatedAt: new Date().toISOString(),
    })

    // Create single player account per user (due to unique constraint)
    console.log(operatorId)
    console.log(_operator[0].id)
    await db.insert(profile).values({
      id: `account_${i}`,
      accountNumber: `ACC-${i.toString().padStart(4, '0')}`,
      userId: userId,
      parentId: operatorId,
      shopId: _operator[0].id,
      bankId: bankId,
      profileNumber: i.toString(),

      phpId: i, // Unique phpId for each account
      isActive: true,
      updatedAt: new Date().toISOString(),
    })
    console.log(userId)
    console.log(`account_${i}`)
    const accountId = `account_${i}`
    await db
      .update(user)
      .set({
        activeProfileId: `account_${i}`,
      })
      .where(eq(user.id, userId))
    const updatedUserId: { activeProfileId: string | null }[] = await db
      .update(user)
      .set({ activeProfileId: accountId })
      .where(eq(user.id, userId))
      .returning({ activeProfileId: user.activeProfileId })
    console.log(updatedUserId)
  }
}

// Run the seed
seedDatabase()
  .then(() => console.log('Database seeded successfully'))
  .catch((error) => console.error('Seeding failed:', error))
