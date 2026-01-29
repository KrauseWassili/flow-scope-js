export function getHeader(req: any, name: string): string | undefined {
  const v = req.headers?.[name.toLowerCase()];
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : String(v);
}
