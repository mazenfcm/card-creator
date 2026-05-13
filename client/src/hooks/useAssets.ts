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
    try {
      // Load flags directly from folder
      const flagModules = import.meta.glob('../../public/assets/flags/*.png', { eager: true }) as Record<string, any>;
      const flagAssets = Object.entries(flagModules)
        .map(([path, module]) => {
          const filename = path.split('/').pop() || '';
          return {
            id: filename,
            name: filename.replace(/\.png$/, ''),
            url: (module as any).default || module,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setFlags(flagAssets);
      
      // Load leagues directly from folder
      const leagueModules = import.meta.glob('../../public/assets/leagues/*.png', { eager: true }) as Record<string, any>;
      const leagueAssets = Object.entries(leagueModules)
        .map(([path, module]) => {
          const filename = path.split('/').pop() || '';
          return {
            id: filename,
            name: filename.replace(/\.png$/, ''),
            url: (module as any).default || module,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setLeagues(leagueAssets);
      
      // Load clubs directly from folder
      const clubModules = import.meta.glob('../../public/assets/clubs/*.png', { eager: true }) as Record<string, any>;
      const clubAssets = Object.entries(clubModules)
        .map(([path, module]) => {
          const filename = path.split('/').pop() || '';
          return {
            id: filename,
            name: filename.replace(/\.png$/, ''),
            url: (module as any).default || module,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setClubs(clubAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { flags, leagues, clubs, loading };
}
