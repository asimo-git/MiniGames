export interface InfoWidget {
  label: string;
  value: string;
}

export interface TopRecord {
  medal: string;
  username: string;
  score: string;
  timeAgo: string;
}

export type AvatarColor = 'random-1' | 'random-3' | 'primary';

export interface Comment {
  initial: string;
  avatarColor: AvatarColor;
  username: string;
  timeAgo: string;
  text: string;
  likesCount: number;
  isLiked: boolean;
}

export const GAME_TITLE = 'Tukoni: Forest Keepers';
export const GAME_RATING = '4.9';
export const GAME_LIKES = '31.2K';
export const GAME_HERO_IMAGE = '/assets/images/hero-detail-dialog.png';

export const GAME_DESCRIPTION =
  'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.';

export const INFO_WIDGETS: InfoWidget[] = [
  { label: 'Genre', value: 'Puzzle' },
  { label: 'Players', value: 'Solo' },
  { label: 'Duration', value: '40-90 min' },
  { label: 'Price', value: 'Free' },
];

export const TOP_RECORDS: TopRecord[] = [
  { medal: '🥇', username: 'ForestSpirit', score: '356,700 pts', timeAgo: '2 days ago' },
  { medal: '🥈', username: 'TeaBrewer', score: '332,400pts', timeAgo: '5 days ago' },
  { medal: '🥉', username: 'HerbalistPath', score: '308,900 pts', timeAgo: '1 week ago' },
];

export const COMMENTS: Comment[] = [
  {
    initial: 'F',
    avatarColor: 'random-3',
    username: 'ForestDweller',
    timeAgo: '3 hours ago',
    text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
    likesCount: 12,
    isLiked: false,
  },
  {
    initial: 'H',
    avatarColor: 'primary',
    username: 'HerbalTeaLover',
    timeAgo: '1 day ago',
    text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
    likesCount: 5,
    isLiked: false,
  },
  {
    initial: 'C',
    avatarColor: 'random-1',
    username: 'CottageCoreMia',
    timeAgo: '3 days ago',
    text: 'I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
    likesCount: 8,
    isLiked: true,
  },
];
