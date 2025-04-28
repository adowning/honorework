export async function request(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  uri: string,
  body: unknown,
  query: Record<string, string>,
): Promise<any> {
  const url = new URL('https://api.cashflowcasino.com/api' + uri)
  url.search = new URLSearchParams(query).toString()
  const token = localStorage.getItem('access_token')
  if (!token && !uri.includes('login') && !uri.includes('register'))
    throw new Error('No access token')
  const params: RequestInit = {
    method,
    // Required for content to be correctly parsed by NestJS
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  }

  // Setting a body is forbidden on GET requests
  if (method !== 'GET') {
    params.body = JSON.stringify(body)
  }

  return fetch(url.toString(), params).then((res) => {
    // Handle failed requests
    if (!res.ok) {
      throw Error(res.statusText)
    }

    return res.json()
  })
}
