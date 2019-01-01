import * as url from 'url';

export default function getCollectionNameFromApi(path: string): string {
  const { pathname } = url.parse(path);

  if (!pathname) {
    return '';
  }

  let normalizedPathname = pathname;
  if (pathname[pathname.length - 1] === '/') {
    normalizedPathname = pathname.slice(0, -1);
  }

  return normalizedPathname.split('/').slice(-1)[0];
}
