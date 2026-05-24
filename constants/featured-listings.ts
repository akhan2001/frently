// Hardcoded showcase units for the landing page's "Featured" grid.
// Replace with `await getLatestListings(6)` once real data is flowing.
//
// Image URLs come from Unsplash; if you swap to next/image, add
// `images.unsplash.com` to next.config.ts `images.remotePatterns`.

export type FeaturedUnit = {
  id: string;
  title: string;
  address: string;
  city: string;
  province: 'ON';
  rent: number;
  beds: number;
  /** Whole or half — matches the BATHROOM_OPTIONS shape. */
  baths: number;
  sqft: number;
  image: string;
};

export const FEATURED_UNITS: readonly FeaturedUnit[] = [
  {
    id: 'f1',
    title: 'King West Loft',
    address: '412 King Street West, Unit 1208',
    city: 'Toronto',
    province: 'ON',
    rent: 2850,
    beds: 2,
    baths: 1,
    sqft: 740,
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1170&auto=format&fit=crop',
  },
  {
    id: 'f2',
    title: 'Bloor East One-Bed',
    address: '88 Bloor Street East, Unit 504',
    city: 'Toronto',
    province: 'ON',
    rent: 2400,
    beds: 1,
    baths: 1,
    sqft: 560,
    image:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1170&auto=format&fit=crop',
  },
  {
    id: 'f3',
    title: 'Queen West Upper',
    address: '1110 Queen Street W, Upper',
    city: 'Toronto',
    province: 'ON',
    rent: 3200,
    beds: 3,
    baths: 2,
    sqft: 1180,
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1170&auto=format&fit=crop',
  },
  {
    id: 'f4',
    title: 'Hazelton Townhouse',
    address: '27 Hazelton Avenue',
    city: 'Toronto',
    province: 'ON',
    rent: 4700,
    beds: 3,
    baths: 3,
    sqft: 1640,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1170&auto=format&fit=crop',
  },
  {
    id: 'f5',
    title: 'Wellington Suite',
    address: '250 Wellington Street W, Unit 3402',
    city: 'Toronto',
    province: 'ON',
    rent: 3050,
    beds: 2,
    baths: 2,
    sqft: 880,
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1170&auto=format&fit=crop',
  },
  {
    id: 'f6',
    title: 'Iceboat Terrace',
    address: '15 Iceboat Terrace, Unit 1715',
    city: 'Toronto',
    province: 'ON',
    rent: 2650,
    beds: 1,
    baths: 1,
    sqft: 610,
    image:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1170&auto=format&fit=crop',
  },
];
