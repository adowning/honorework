import jwt from 'jsonwebtoken'

async function generateAccessToken(userId: string) {
  const token = await jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1yr' },
  )
  console.log('this token: ', token)
  return token
}

async function generateRefreshToken(userId: string) {
  return await jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET!,
    // { expiresIn: process.env.REFRESH_TOKEN_EXPIRY! }
    { expiresIn: '7d' },
  )
}

export { generateAccessToken, generateRefreshToken }
