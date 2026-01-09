import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function useMessages() {
  return useSWR('/api/messages', fetcher, { refreshInterval: 1000 });
}
