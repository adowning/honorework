export const showMessage = (status: number | string): string => {
  let message = '';
  switch (status) {
    case 400:
      message = 'Request error (400)';
      break;
    case 401:
      message = 'Unauthorized, please log in again (401)';
      break;
    case 403:
      message = 'Access denied (403)';
      break;
    case 404:
      message = 'Request error (404)';
      break;
    case 408:
      message = 'Request timeout (408)';
      break;
    case 500:
      message = 'Server error (500)';
      break;
    case 501:
      message = 'Service not implemented (501)';
      break;
    case 502:
      message = 'Network error (502)';
      break;
    case 503:
      message = 'Service unavailable (503)';
      break;
    case 504:
      message = 'Network timeout (504)';
      break;
    case 505:
      message = 'HTTP version not supported (505)';
      break;
    default:
      message = `Connection error (${status})!`;
  }
  return `${message}, please check the network or contact the administrator! `;
};