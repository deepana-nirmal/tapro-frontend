export const resolveApiErrorMessage = (error: any, fallback: string) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status >= 500) {
    return fallback;
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (typeof error?.message === 'string' && error.message.trim() && !String(error.message).startsWith('Request failed')) {
    return error.message;
  }

  return fallback;
};
