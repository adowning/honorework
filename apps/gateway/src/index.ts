import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { RouterHandler, ThanhHoaWebSocket } from './server'
import { authMiddleware } from './auth.middleware'
import { setupHandler } from './handlers/setup.handler'
import { sessionManager } from './services/session.service'
import { Logger } from '@thanhhoajs/logger'
import { listenForNotifications } from './handlers/stats.handler'
import { Pool } from 'pg'
import { startHeartbeatLoop } from './handlers/heartbeat.handler'
import { db } from './db'
import { schema } from './db'
import { eq } from 'drizzle-orm'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { generateAccessToken } from './jwt'
const app = new Hono()
app.use('/*', cors())

// JWT Configuration
// app.use('/ws/*', jwt({ secret: process.env.JWT_SECRET! }))

// app.use(
//   '/auth/*',
//   jwt({
//     secret: 'it-is-very-secret',
//   }),
// )
// app.use(
//   '/auth-verify-token/*',
//   bearerAuth({
//     verifyToken: async (token, c) => {
//       console.log('x')
//       return token === 'dynamic-token'
//     },
//   }),
// )
// app.use(
//   '/api/*',
//   jwk({
//     jwks_uri: `http://localhost:3001/.well-known/jwks.json`,
//   }),
// )
async function createUser(username: string, password: string, c) {
  const passwordHash = await Bun.password.hash(password)
  const userId = crypto.randomUUID()

  try {
    const user = await db
      .insert(schema.user)
      .values({
        id: userId,
        username,
        email: `${username}@example.com`,
        passwordHash,
        totalXp: 0,
        balance: '0',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
      })
      .returning()

    return { user, error: null }
  } catch (err) {
    return { user: null, error: err.message }
  }
}
async function validateUser(username: string, password: string, c) {
  //console.log(username);
  const user = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.username, username))
  console.log(user)
  if (user.length < 1) {
    return null
  }
  const isPasswordValid = await Bun.password.verify(
    password,
    user[0].passwordHash,
  )
  // const hasher = new Bun.CryptoHasher("sha256", "secret-key");
  // hasher.update(user.password);
  // console.log(hasher.digest("hex"));
  // const hashedPassword = hasher.digest("hex");
  //console.log(isPasswordValid);
  if (isPasswordValid === false) {
    return null
  }

  return user
}
app.post('/api/auth/login', async (c, next) => {
  const { username, password } = await c.req.json()
  console.log(username, password)
  if (username === undefined || password === undefined) {
    return c.newResponse('Missing username or password', 401)
  }
  const user = await validateUser(username, password, c)
  console.log('105,', user)
  if (user == null) {
    return c.newResponse('No users by that name', 401)
  } else {
    const token = await generateAccessToken(user[0].id)
    console.log('token ', token)
    setCookie(c, 'cookie', token)
    return c.newResponse(
      JSON.stringify({ authenticated: true, token, user: user[0], code: 200 }),
      200,
    )
  }
})
app.post('/api/auth/register', async (c, next) => {
  const { username, password } = await c.req.json()
  console.log(username, password)
  if (username === undefined || password === undefined) {
    return c.newResponse('Missing username or password', 402)
  }
  const { user, error } = await createUser(username, password, c)
  console.log('105,', user)
  if (error !== null) {
    return c.newResponse('Error', error)
  } else {
    if (user === null) return c.newResponse('Unknown error', 503)
    const token = await generateAccessToken(user[0].id)
    setCookie(c, 'cookie', token)
    //@ts-ignore
    delete user[0].passwordHash
    return c.newResponse(
      JSON.stringify({ authenticated: true, token, user: user[0], code: 200 }),
      200,
    )
  }
})

const ws = new ThanhHoaWebSocket({ port: 3000 })
const router = new RouterHandler()
const authRouter = new RouterHandler()

const logger = Logger.get('SERVER')

// Define route handlers

// Add routes
// router.route("heartbeat", authMiddleware, heartbeatHandler);
// router.route("chat", authMiddleware, chatHandler);
router.route('setup', authMiddleware, setupHandler)
// router.route("/:type/:gameName", authMiddleware, setupHandler);
// router.route("stats", authMiddleware, statsHandler);
// router.route("heartbeat", authMiddleware, heartbeatHandler);
//authRouter.route('authenticate', authHandler)
// Group routes
ws.group('api', router)
//ws.group('auth', authRouter)
// Global error handling
ws.on('error', (error, ws) => {
  console.error('WebSocket error:', error)

  // sessionManager.clearHeartbeat(ws as ServerWebSocket<ICashflowWebSocketData>);
  sessionManager.removeOne(ws.data.custom!.user.id)
  ws.close(1011, 'Internal Server Error')
})

// Broadcast server status every 5 seconds
setInterval(() => {
  const stats = ws.getStats()
  // console.log("broadcasting stats", stats);
  ws.broadcast(JSON.stringify({ type: 'serverStatus', data: stats }))
}, 5000)

startHeartbeatLoop(3000)
console.log(process.env.DATABASE_URL)
const dbPool = new Pool({ connectionString: process.env.DATABASE_URL })
// const sessionManager = new SessionManager();
// const websocketHandler = new WebSocketHandler(sessionManager, dbPool);

listenForNotifications(dbPool, sessionManager).catch((err) =>
  console.error(err),
)

logger.info(`Advanced WebSocket server is running on ws://localhost:${ws.port}`)

// Start servers
serve({
  fetch: app.fetch,
  port: 3001,
})

console.log('WebSocket Server running on port 3000')
console.log('HTTP Server running on port 3001')
