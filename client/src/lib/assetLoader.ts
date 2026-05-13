// Asset loader for GitHub Pages
export async function loadAssetsFromFolder(folderPath: string): Promise<{ name: string; url: string }[]> {
  try {
    const response = await fetch(`./assets/${folderPath}/`);
    if (!response.ok) return [];
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const links = Array.from(doc.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      .filter((href): href is string => !!href && (href.endsWith('.png') || href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.svg')))
      .map(href => ({
        name: href.replace(/\.[^.]+$/, ''),
        url: `./assets/${folderPath}/${href}`
      }));
    
    return links;
  } catch (error) {
    console.error(`Failed to load assets from ${folderPath}:`, error);
    return [];
  }
}
