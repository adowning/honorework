// // import { Client } from '@hyper-fetch/core'
// import { request } from '@/sdk-interface'
// import { eventBus } from './eventBus'
// import { router } from '@/router'
// // interface LoginResponseType {
// //   token: string
// //   refreshToken: string
// // }
// interface RequestType {
//   email: string
//   password: string
// }

// // export const testClient = new Client({ url: 'https://api.cashflowcasino.com' })

// // export const postLogin = testClient.createRequest<ResponseType, RequestType>()({
// //   method: 'POST',
// //   endpoint: '/auth/login',
// // })

// export function useRequest() {
//   let authToken = localStorage.getItem('access_token')

//   function logOut(req: any, code?: number) {
//     const router = useRouter()
//     console.log('logging out user from request ', code)
//     localStorage.clear()
//     nextTick(() => {
//       eventBus.emit('loginResults', false)
//       router.push('/login')
//       return req
//     })
//   }
//   const client = new request(
//     // url: 'https://3003.cashflowcasino.com',
//     'https://api.cashflowcasino.com',a

//   )
//     .setRequestDefaultOptions((request) => {
//       return { ...request, options: { withCredentials: true, timeout: 2000, auth: true } }
//     })
//     .onRequest((req) => {
//       return req.setHeaders({
//         ...req.headers,
//         Authorization: `Bearer ${authToken}`,
//       })
//     })
//     .onResponse((res, req) => {
//       if (req.requestOptions.endpoint === '/api/auth/login') {
//         if (res.error === null) {
//           // eventBus.emit('loginResults', res.data)
//         } else {
//           eventBus.emit('loginResults', false)
//         }
//       }
//       return res
//     })
//     .setDebug(true)

//   client.onAuth((request) => {
//     // if (authToken === '' || authToken == null || authToken === undefined) {
//     //   const t = localStorage.getItem('access_token')
//     //   if (typeof t == 'string') authToken = t
//     // }
//     // if (!authToken || authToken === null)
//     if (authToken === null) authToken = localStorage.getItem('access_token')
//     // For every authenticated request we want to
//     // add the header with token and return the extended request
//     return request.setHeaders({
//       ...request.headers,
//       Authorization: `Bearer ${authToken}`,
//     })
//     // return request
//   })

//   client.onError(async (response, request) => {
//     const status = response.status
//     // const qqqToken = localStorage.getItem('token')
//     // if (!request.used && status === 404) {
//     // }
//     if (status === 401) {
//       // Prepare the refresh token request
//       // console.log('pushing user to login')
//       // logOut(request, 401)
//     }
//     console.log('an error occurred status:', response.error)
//     return response
//   })
//   // Object.entries(api).forEach(([key, value]: any) => {
//   //   if (key !== undefined) value.client = client
//   // })

//   return {
//     // api,
//   }
// }

// // const apiClient = createApiClient(axios)
// // apiClient.setRequestDefaultOptions((request: any) => {
// //   return { ...request, options: { withCredentials: true, timeout: 2000 } }
// // })
// // apiClient.

// // API requires no authentication, so use the anonymous
// // authentication provider
// // const authProvider = new AnonymousAuthenticationProvider();
// // // Create request adapter using the fetch-based implementation
// // const adapter = new FetchRequestAdapter(authProvider);
// // Create the API client
