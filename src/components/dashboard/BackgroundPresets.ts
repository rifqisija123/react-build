// ─── Background Presets ──────────────────────────────────────────────────────

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'image' | 'transparent';
  value: string;
  gradientStops?: [number, string][];
  thumbnailCss?: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Transparent / Removed Background
  {
    id: 'bg-transparent',
    name: 'Transparent',
    type: 'transparent',
    value: 'transparent'
  },
  // Scenic Images
  {
    id: 'bg-sunset-ocean',
    name: 'Sunset Ocean',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-sunlit-forest',
    name: 'Sunlit Forest',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-snowy-pines',
    name: 'Snowy Pines',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-foggy-woods',
    name: 'Foggy Woods',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1511497584788-876760111969?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-misty-mountains',
    name: 'Misty Mountains',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-golden-bokeh',
    name: 'Golden Bokeh',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-heart-bokeh',
    name: 'Heart Bokeh',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-night-lights',
    name: 'Night Lights',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-abstract-wave',
    name: 'Abstract Wave',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1513151233558-d860c5398176?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-tree-shadows',
    name: 'Tree Shadows',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=120&auto=format&fit=crop&q=80)'
  },
  {
    id: 'bg-wood-texture',
    name: 'Wood Texture',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80',
    thumbnailCss: 'url(https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=120&auto=format&fit=crop&q=80)'
  },

  // Gradients
  {
    id: 'bg-grad-ocean',
    name: 'Ocean Breeze',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    gradientStops: [[0, '#a1c4fd'], [1, '#c2e9fb']],
    thumbnailCss: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
  },
  {
    id: 'bg-grad-warm',
    name: 'Warm Glow',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fddb92 0%, #d1f2e5 100%)',
    gradientStops: [[0, '#fddb92'], [1, '#d1f2e5']],
    thumbnailCss: 'linear-gradient(135deg, #fddb92 0%, #d1f2e5 100%)'
  },
  {
    id: 'bg-grad-pink',
    name: 'Pink Bubble',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fecfef 0%, #ffdfd9 100%)',
    gradientStops: [[0, '#fecfef'], [1, '#ffdfd9']],
    thumbnailCss: 'linear-gradient(135deg, #fecfef 0%, #ffdfd9 100%)'
  },
  {
    id: 'bg-grad-lavender',
    name: 'Soft Lavender',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    gradientStops: [[0, '#e0c3fc'], [1, '#8ec5fc']],
    thumbnailCss: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
  },
  {
    id: 'bg-grad-peach',
    name: 'Peach Sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    gradientStops: [[0, '#ff9a9e'], [1, '#fecfef']],
    thumbnailCss: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  {
    id: 'bg-grad-vibrant',
    name: 'Vibrant Sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    gradientStops: [[0, '#f6d365'], [1, '#fda085']],
    thumbnailCss: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
  },

  // Solids
  {
    id: 'bg-solid-white',
    name: 'Pure White',
    type: 'color',
    value: '#ffffff',
    thumbnailCss: '#ffffff'
  },
  {
    id: 'bg-solid-blue',
    name: 'Pastel Blue',
    type: 'color',
    value: '#e0f2fe',
    thumbnailCss: '#e0f2fe'
  },
  {
    id: 'bg-solid-orange',
    name: 'Pastel Orange',
    type: 'color',
    value: '#ffedd5',
    thumbnailCss: '#ffedd5'
  },
  {
    id: 'bg-solid-pink',
    name: 'Pastel Pink',
    type: 'color',
    value: '#fce7f3',
    thumbnailCss: '#fce7f3'
  },
  {
    id: 'bg-solid-purple',
    name: 'Pastel Purple',
    type: 'color',
    value: '#f3e8ff',
    thumbnailCss: '#f3e8ff'
  },
  {
    id: 'bg-solid-peach',
    name: 'Pastel Peach',
    type: 'color',
    value: '#ffe4e6',
    thumbnailCss: '#ffe4e6'
  },
  {
    id: 'bg-solid-red',
    name: 'Studio Red',
    type: 'color',
    value: '#991b1b',
    thumbnailCss: '#991b1b'
  }
];
