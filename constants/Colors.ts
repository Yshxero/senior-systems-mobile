/**
 * Colors.ts
 * 
 * Central color palette for the Senior Records app.
 * Uses a modern dark navy / teal / emerald theme for a professional, premium feel.
 */

const Colors = {
  // Primary palette
  primary: '#0EA5E9',        // Sky blue — main brand color
  primaryDark: '#0284C7',    // Darker sky blue for pressed states
  primaryLight: '#38BDF8',   // Light sky blue for highlights

  // Accent
  accent: '#10B981',         // Emerald green — success / action color
  accentDark: '#059669',     // Darker emerald for pressed states

  // Danger
  danger: '#EF4444',         // Red for delete / error actions
  dangerDark: '#DC2626',     // Darker red for pressed states
  dangerLight: '#FEE2E2',   // Light red background for error states

  // Background & Surface
  background: '#0F172A',     // Deep navy — main background
  backgroundLight: '#1E293B', // Slightly lighter navy — cards, surfaces
  surface: '#334155',        // Slate — input backgrounds, elevated surfaces
  surfaceLight: '#475569',   // Lighter slate — borders, dividers

  // Text
  text: '#F8FAFC',           // Almost white — primary text
  textSecondary: '#94A3B8',  // Muted slate — secondary / placeholder text
  textDark: '#0F172A',       // Dark text for light backgrounds

  // Borders & Dividers
  border: '#334155',         // Subtle border color
  borderLight: '#475569',    // Slightly visible border

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay

  // Tab bar
  tabActive: '#0EA5E9',      // Active tab icon color
  tabInactive: '#64748B',    // Inactive tab icon color
};

export default Colors;
