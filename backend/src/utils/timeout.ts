import { ApiError } from './apiError';

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, code: string, message: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  const timer = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => reject(ApiError.serviceUnavailable(message, { timeoutMs }, code)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
