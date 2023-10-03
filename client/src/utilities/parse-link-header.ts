export type Links = Record<string, string>;

export function parseLinkHeader(header: string) {
  const parts = header.split(',');
  const links: Links = {};

  parts.forEach((part) => {
    const section = part.split(';');
    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const rel = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[rel] = url;
  });

  return links;
}
