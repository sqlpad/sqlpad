let _baseUrl = '';

export default function baseUrl(value?: string) {
  if (typeof value === 'string') {
    _baseUrl = value;
  }
  return _baseUrl;
}
