import { useState, useEffect } from 'react';
import assetsData from '@/data/assets.json';

export interface Asset {
  id: string;
  name: string;
  url: string;
}

export function useAssets() {
  const [flags, setFlags] = useState<Asset[]>([]);
  const [leagues, setLeagues] = useState<Asset[]>([]);
  const [clubs, setClubs] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setFlags(assetsData.flags.map((filename: string) => ({
        id: filename,
        name: filename.replace('.png', ''),
        url: `./assets/flags/${filename}`,
      })));
      
      setLeagues(assetsData.leagues.map((filename: string) => ({
        id: filename,
        name: filename.replace('.png', ''),
        url: `./assets/leagues/${filename}`,
      })));
      
      setClubs(assetsData.clubs.map((filename: string) => ({
        id: filename,
        name: filename.replace('.png', ''),
        url: `./assets/clubs/${filename}`,
      })));
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { flags, leagues, clubs, loading };
}
