import { conf } from '@/config';
import { createHmac } from 'node:crypto';

const externalProxyUrlBase = new URL(
  `${conf.server.backendBaseUrl}api/v1/proxy/image`,
).toString();

function createProxySignature(url: string) {
  const hmac = createHmac('sha256', conf.crypto.secret);
  hmac.update(url);
  const signature = hmac.digest('hex');
  return signature;
}

export function createProxyUrl(imageUrl: string) {
  const url = new URL(externalProxyUrlBase);
  url.searchParams.set('url', imageUrl);
  url.searchParams.set('sig', createProxySignature(imageUrl));
  return url.toString();
}

export function verifyProxySignature(imageUrl: string, signature: string) {
  const realSignature = createProxySignature(imageUrl);
  return realSignature === signature;
}
