// ============================================================
//  PERIKOPA — Design System : Palette "Ciel Malgache"
//  Utilisable avec NativeWind (Tailwind) + React Native
// ============================================================

export const colors = {
  // ── Fonds ──────────────────────────────────────────────────
  background: {
    primary:   '#F0F7FF',   // fond principal — bleu ciel très clair
    secondary: '#DBEAFE',   // surfaces, cards légères
    tertiary:  '#C8E0F9',   // séparateurs, hover states
    overlay:   'rgba(30, 58, 95, 0.5)', // modales, overlays sombres
  },

  // ── Textes ─────────────────────────────────────────────────
  text: {
    primary:   '#1E3A5F',   // texte principal — bleu nuit profond
    secondary: '#3B5E82',   // texte secondaire, labels
    tertiary:  '#6B8FAD',   // placeholders, numéros de versets discrets
    inverse:   '#F0F7FF',   // texte sur fond sombre (bouton primaire)
    gold:      '#C8900A',   // numéros de versets en accent doré
  },

  // ── Couleur Primaire (Bleu Océan) ──────────────────────────
  primary: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',   // ← valeur principale
    700: '#1D4ED8',
    800: '#1E3A5F',
    900: '#0F2440',
    DEFAULT: '#2563EB',
  },

  // ── Accent Or (Highlights Perikopa) ───────────────────────
  gold: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#E8C547',   // ← highlight verset Perikopa
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    DEFAULT: '#E8C547',
  },

  // ── Accent Émeraude (Favoris / Succès) ────────────────────
  emerald: {
    50:  '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',   // ← favoris, icône bookmark actif
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    DEFAULT: '#059669',
  },

  // ── Utilitaires ────────────────────────────────────────────
  error:   '#DC2626',
  warning: '#F59E0B',
  info:    '#2563EB',
  white:   '#FFFFFF',
  black:   '#000000',
  transparent: 'transparent',
} as const;


// ── Tokens Sémantiques ──────────────────────────────────────
//  Utilisez ces tokens dans vos composants, pas les raw colors
// ────────────────────────────────────────────────────────────
export const tokens = {

  // Écran lecteur
  reader: {
    background:          colors.background.primary,
    verseText:           colors.text.primary,
    verseNumber:         colors.gold[600],
    verseNumberHover:    colors.primary[600],
    verseSelectedBg:     'rgba(232, 197, 71, 0.18)',   // highlight sélection
    verseSelectedBorder: colors.gold[600],
    perikopaHighlight:   'rgba(232, 197, 71, 0.28)',   // surbrillance Perikopa
    perikopaLabel:       colors.primary[600],
    bookmarkActive:      colors.emerald[600],
    bookmarkInactive:    colors.text.tertiary,
  },

  // Header / Navigation
  header: {
    background:     'rgba(240, 247, 255, 0.85)',  // BlurView fallback
    border:         colors.background.tertiary,
    title:          colors.text.primary,
    subtitle:       colors.primary[600],
    iconColor:      colors.text.secondary,
    iconActiveColor: colors.primary[600],
  },

  // Floating Action Bar
  fab: {
    background:   'rgba(219, 234, 254, 0.75)',   // glassmorphism
    border:       'rgba(37, 99, 235, 0.2)',
    iconColor:    colors.primary[600],
    iconHover:    colors.primary[700],
    copyBtn:      colors.primary[600],
    shareBtn:     colors.emerald[600],
    bookmarkBtn:  colors.gold[600],
  },

  // Badges / Pills
  badge: {
    perikopa: {
      bg:   colors.primary[100],
      text: colors.primary[800],
    },
    bookmark: {
      bg:   colors.emerald[100] ?? '#D1FAE5',
      text: colors.emerald[700],
    },
    chapter: {
      bg:   colors.background.secondary,
      text: colors.text.secondary,
    },
  },

  // Barre de navigation du programme Perikopa
  perikopaBar: {
    background:     colors.background.secondary,
    border:         colors.background.tertiary,
    itemActive:     colors.primary[600],
    itemInactive:   colors.text.tertiary,
    progressBg:     colors.background.tertiary,
    progressFill:   colors.primary[600],
  },

  // Home screen / Splash
  home: {
    background:     colors.background.primary,
    title:          colors.text.primary,
    verseOfDay:     colors.text.primary,
    verseRef:       colors.primary[600],
    ctaBg:          colors.primary[600],
    ctaText:        colors.text.inverse,
    ctaHoverBg:     colors.primary[700],
    meshBlob1:      'rgba(37, 99, 235, 0.07)',    // coin haut gauche
    meshBlob2:      'rgba(5, 150, 105, 0.06)',    // coin bas droite
    meshBlob3:      'rgba(232, 197, 71, 0.08)',   // centre-bas
  },

} as const;


// ── Typographie ────────────────────────────────────────────
export const typography = {
  // Famille
  fontVerset:   'Georgia',          // serifs pour les versets
  fontUI:       'System',           // sans-serif pour l'UI

  // Tailles
  size: {
    xs:   12,
    sm:   13,
    base: 16,
    lg:   18,
    xl:   22,
    '2xl': 28,
    '3xl': 36,
  },

  // Poids
  weight: {
    regular: '400' as const,
    medium:  '500' as const,
    bold:    '700' as const,
  },

  // Interligne — généreux pour faciliter la lecture
  lineHeight: {
    tight:   1.4,
    normal:  1.75,   // ← versets
    relaxed: 2.0,
  },
} as const;


// ── Espacements ────────────────────────────────────────────
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 28,
  '3xl': 40,
} as const;


// ── Rayons de bordure ──────────────────────────────────────
export const radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;


// ── Animations (valeurs pour Reanimated) ──────────────────
export const animation = {
  // Spring physique — swipe chapitres
  spring: {
    damping:   20,
    stiffness: 180,
    mass:      0.8,
  },
  // Cascade versets — délai entre chaque verset
  stagger: {
    delayMs: 25,
    durationMs: 250,
    translateY: 15,   // px, départ de la translation
  },
  // FAB apparition
  fab: {
    durationMs: 150,
    scaleFrom:  0.9,
  },
  // Durée standard
  durationFast:   100,
  durationNormal: 200,
  durationSlow:   300,
} as const;


// ── Ombres (Platform-specific) ─────────────────────────────
export const shadows = {
  card: {
    shadowColor:   colors.primary[800],
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  8,
    elevation:     3,   // Android
  },
  fab: {
    shadowColor:   colors.primary[600],
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius:  16,
    elevation:     8,
  },
} as const;


// ── Export global pratique ─────────────────────────────────
const theme = {
  colors,
  tokens,
  typography,
  spacing,
  radius,
  animation,
  shadows,
} as const;

export default theme;
