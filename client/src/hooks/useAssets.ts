import { useState, useEffect } from 'react';

export interface Asset {
  id: string;
  name: string;
  url: string;
}

const GITHUB_REPO = 'mazenfcm/card-creator';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';

async function loadAssetsFromGitHub(folder: string): Promise<Asset[]> {
  try {
    // Get list of files from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/card-creator/assets/${folder}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch ${folder}:`, response.status);
      return [];
    }
    
    const files = await response.json();
    console.log(`Loaded ${folder}:`, files.length, 'files');
    
    const assets = files
      .filter((file: any) => file.name.endsWith('.png'))
      .filter((file: any) => !file.name.startsWith('.'))
      .map((file: any) => ({
        id: file.name,
        name: file.name.replace(/\.png$/, ''),
        url: `${GITHUB_RAW_URL}/${GITHUB_REPO}/main/card-creator/assets/${folder}/${file.name}`,
      }))
      .sort((a: Asset, b: Asset) => a.name.localeCompare(b.name));
    
    console.log(`Filtered ${folder}:`, assets.length, 'PNG files');
    return assets;
  } catch (error) {
    console.error(`Error loading ${folder}:`, error);
    return [];
  }
}

export function useAssets() {
  const [flags, setFlags] = useState<Asset[]>([]);
  const [leagues, setLeagues] = useState<Asset[]>([]);
  const [clubs, setClubs] = useState<Asset[]>([]);
  const [backgrounds, setBackgrounds] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [flagsData, leaguesData, clubsData, backgroundsData] = await Promise.all([
          loadAssetsFromGitHub('flags'),
          loadAssetsFromGitHub('leagues'),
          loadAssetsFromGitHub('clubs'),
          loadAssetsFromGitHub('backgrounds'),
        ]);
        
        setFlags(flagsData);
        setLeagues(leaguesData);
        setClubs(clubsData);
        setBackgrounds(backgroundsData);
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  return { flags, leagues, clubs, backgrounds, loading };
}
