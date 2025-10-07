export const palette = {
    dark: {
        primary: '#080F24',      // base dark background
        secondary: '#302E52',    // surface / soft contrast
        text: '#EAD9B0',        // main text on dark background
        border: '#070F23',      // deep shadow
        muted: '#0B0E1A',       // almost black
        accent: '#F4A218',      // energy color (buttons, focus)
        warning: '#CA2F1C',     // alert or strong action
        success: '#EAD9B0',     // warm light / confirmation
        light100: '#EAD9B0',    // warm lighthouse light
        light200: '#F4A218',    // energetic ray
        light300: '#CA2F1C',    // lighthouse red
        dark100: '#070F23',     // deep shadow
        dark200: '#0B0E1A',     // almost black
    },
    light: {
        primary: '#F5F3EF',     // light background
        secondary: '#E4E1DC',   // light surface
        text: '#151515',        // dark text
        border: '#B7B4AE',      // light border
        muted: '#8E8B84',       // muted gray
        accent: '#F4A218',      // energy color
        warning: '#CA2F1C',     // alert red
        success: '#4CAF50',     // success green
        light100: '#302E52',    // dark ink for headings
        light200: '#CA2F1C',    // red accent
        light300: '#F4A218',    // orange accent
        dark100: '#B7B4AE',     // border gray
        dark200: '#8E8B84',     // muted gray
    }
}

export const tailwindColors = {
    primary: {
        DEFAULT: palette.light.primary,
        dark: palette.dark.primary,
    },
    secondary: {
        DEFAULT: palette.light.secondary,
        dark: palette.dark.secondary,
    },
    text: {
        DEFAULT: palette.light.text,
        dark: palette.dark.text,
    },
    border: {
        DEFAULT: palette.light.border,
        dark: palette.dark.border,
    },
    muted: {
        DEFAULT: palette.light.muted,
        dark: palette.dark.muted,
    },
    accent: {
        DEFAULT: palette.light.accent,
        dark: palette.dark.accent,
    },
    warning: {
        DEFAULT: palette.light.warning,
        dark: palette.dark.warning,
    },
    success: {
        DEFAULT: palette.light.success,
        dark: palette.dark.success,
    },
};

export const colors = palette;