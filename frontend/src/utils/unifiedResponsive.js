// 🚀 UNIFIED RESPONSIVE UTILITIES - Eliminates duplication across ALL components
// Use this in: Admin components, User components, Posts, Navigation, etc.

// ===== RESPONSIVE SPACING =====
export const spacing = {
  // Container padding - used in ALL components
  container: "p-4 sm:p-6 lg:p-8",
  containerSmall: "p-2 sm:p-3 md:p-4 lg:p-6",
  containerLarge: "p-6 sm:p-8 lg:p-10 xl:p-12",
  
  // Section margins - used in ALL components  
  section: "mb-6 sm:mb-8 lg:mb-10",
  sectionSmall: "mb-4 sm:mb-6",
  sectionLarge: "mb-8 sm:mb-10 lg:mb-12",
  
  // Item margins - used in lists, cards, etc.
  item: "mb-3 sm:mb-4 lg:mb-6",
  itemSmall: "mb-2 sm:mb-3",
  itemLarge: "mb-6 sm:mb-8",
  
  // Gap utilities - used in grids, flex layouts
  gap: "gap-3 sm:gap-4 lg:gap-6",
  gapSmall: "gap-2 sm:gap-3",
  gapLarge: "gap-4 sm:gap-6 lg:gap-8"
};

// ===== RESPONSIVE TEXT =====
export const text = {
  // Headings - used in ALL components
  h1: "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold",
  h2: "text-xl sm:text-2xl lg:text-3xl font-bold", 
  h3: "text-lg sm:text-xl lg:text-2xl font-semibold",
  h4: "text-base sm:text-lg font-semibold",
  
  // Body text - used in ALL components
  body: "text-sm sm:text-base lg:text-lg",
  bodySmall: "text-xs sm:text-sm",
  bodyLarge: "text-base sm:text-lg lg:text-xl",
  
  // Caption text
  caption: "text-xs sm:text-sm text-gray-400"
};

// ===== RESPONSIVE LAYOUT =====
export const layout = {
  // Grid layouts - used in ALL components
  grid1: "grid grid-cols-1",
  grid2: "grid grid-cols-1 sm:grid-cols-2",
  grid3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  grid4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  
  // Flex layouts - used in ALL components
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
  flexColMdRow: "flex flex-col md:flex-row",
  flexRowMdCol: "flex flex-row md:flex-col",
  
  // Justify content - used in ALL components
  justifyCenter: "justify-center",
  justifyBetween: "justify-between",
  justifyCenterMdBetween: "justify-center md:justify-between",
  
  // Align items - used in ALL components
  itemsCenter: "items-center",
  itemsStart: "items-start",
  itemsCenterMdStart: "items-center md:items-start"
};

// ===== RESPONSIVE SIZING =====
export const sizing = {
  // Icon sizes - used in ALL components
  icon: {
    xs: "h-3 w-3 sm:h-4 sm:w-4",
    sm: "h-4 w-4 sm:h-5 sm:w-5", 
    md: "h-5 w-5 sm:h-6 sm:w-6",
    lg: "h-6 w-6 sm:h-8 sm:w-8",
    xl: "h-8 w-8 sm:h-10 sm:w-10"
  },
  
  // Button sizes - used in ALL components
  button: {
    sm: "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
    md: "px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base",
    lg: "px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg"
  },
  
  // Input sizes - used in ALL components
  input: {
    sm: "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
    md: "px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base",
    lg: "px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg"
  }
};

// ===== RESPONSIVE COMPONENTS =====
export const components = {
  // Card - used in ALL components
  card: {
    base: "bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 shadow-sm",
    padding: spacing.containerSmall,
    hover: "hover:shadow-md transition-shadow"
  },
  
  // Button variants - used in ALL components
  button: {
    primary: `${sizing.button.md} bg-blue-600 text-white  hover:bg-blue-700 transition-colors`,
    secondary: `${sizing.button.md} border border-white/20 border-white/20 text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`,
    success: `${sizing.button.md} bg-green-600 text-white  hover:bg-green-700 transition-colors`,
    danger: `${sizing.button.md} bg-red-600 text-white  hover:bg-red-700 transition-colors`,
    outline: `${sizing.button.md} border border-white/20 border-white/20 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`
  },
  
  // Input variants - used in ALL components
  input: {
    base: `w-full ${sizing.input.md} border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white`,
    select: `w-full ${sizing.input.md} border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white`,
    textarea: `w-full ${sizing.input.md} border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white resize-none`
  },
  
  // Modal - used in ALL components
  modal: {
    overlay: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4",
    container: "bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl max-w-xs sm:max-w-sm lg:max-w-md w-full max-h-[90vh] overflow-y-auto",
    header: "flex items-center justify-between mb-3 sm:mb-4",
    title: `${text.h4} text-white`,
    closeButton: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
    closeIcon: sizing.icon.md,
    content: "p-4 sm:p-6",
    form: "space-y-3 sm:space-y-4",
    footer: "flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-white/10 border-white/10"
  },
  
  // Form fields - used in ALL components
  formField: {
    label: `block ${text.bodySmall} font-medium text-gray-300 mb-1`,
    grid: `${layout.grid2} ${spacing.gapSmall}`,
    grid3: `${layout.grid3} ${spacing.gapSmall}`,
    checkbox: `${sizing.icon.xs} text-blue-600 focus:ring-blue-500 border-white/20 `,
    checkboxLabel: `ml-2 ${text.bodySmall} text-gray-300`
  }
};

// ===== COMMON PATTERNS =====
export const patterns = {
  // Page container - used in ALL page components
  pageContainer: `min-h-screen bg-black text-white ${spacing.container}`,
  
  // Content wrapper - used in ALL components
  contentWrapper: `max-w-7xl mx-auto ${spacing.container}`,
  
  // Header section - used in ALL components
  header: `bg-black/50 backdrop-blur-xl border border-white/10 text-white border-b border-white/10 border-white/10 ${spacing.containerLarge}`,
  
  // Card grid - used in ALL components
  cardGrid: `${layout.grid3} ${spacing.gap} ${spacing.section}`,
  
  // Action buttons - used in ALL components
  actionButtons: `flex flex-wrap gap-3 justify-center md:justify-start ${spacing.section}`
};

// ===== UTILITY FUNCTIONS =====
export const combine = (...classes) => classes.filter(Boolean).join(' ');

// ===== QUICK ACCESS =====
export const r = {
  spacing,
  text,
  layout,
  sizing,
  components,
  patterns,
  combine
};

// ===== USAGE EXAMPLES =====
/*
// ❌ BEFORE - Duplicated everywhere
className="p-4 sm:p-6 lg:p-8"
className="text-2xl sm:text-3xl lg:text-4xl font-bold"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
className="h-4 w-4 sm:h-5 sm:w-5"

// ✅ AFTER - No duplication, used everywhere
className={r.spacing.container}
className={r.text.h1}
className={r.layout.grid3 + ' ' + r.spacing.gap}
className={r.sizing.icon.sm}

// ❌ BEFORE - Long button classes everywhere
className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white  hover:bg-blue-700 transition-colors text-sm sm:text-base"

// ✅ AFTER - Pre-built button
className={r.components.button.primary}
*/


