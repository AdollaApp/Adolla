export type Scraper = {
  id: string;
  name: string;
  imagePath: string;

  getChapter: (mid: string, cid: string) => void; // TODO add real data
  getManga: (mid: string) => void; // TODO add real data
};

export function makeScraper(input: Scraper): Scraper {
  return input;
}
