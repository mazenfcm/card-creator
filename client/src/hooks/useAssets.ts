import { useState, useEffect } from 'react';

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
    const loadAssets = async () => {
      try {
        const response = await fetch('./assets.json');
        if (!response.ok) throw new Error('Failed to load assets.json');
        
        const data = await response.json();
        
        setFlags(data.flags.map((filename: string) => ({
          id: filename,
          name: filename.replace('.png', ''),
          url: `./assets/flags/${filename}`,
        })));
        
        setLeagues(data.leagues.map((filename: string) => ({
          id: filename,
          name: filename.replace('.png', ''),
          url: `./assets/leagues/${filename}`,
        })));
        
        setClubs(data.clubs.map((filename: string) => ({
          id: filename,
          name: filename.replace('.png', ''),
          url: `./assets/clubs/${filename}`,
        })));
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  return { flags, leagues, clubs, loading };
}
