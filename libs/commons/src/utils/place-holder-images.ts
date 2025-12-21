import { getInitials } from './text-format';

export const PLACE_HOLDER_DOMAIN = 'https://placehold.co/';

export enum FontOptions {
  Lato = 'lato',
  Lora = 'lora',
  Montserrat = 'montserrat',
  NotoSans = 'noto sans',
  OpenSans = 'open sans',
  Oswald = 'oswald',
  PlayfairDisplay = 'playfair display',
  Poppins = 'poppins',
  PTSans = 'pt sans',
  Raleway = 'raleway',
  Roboto = 'roboto',
  SourceSansPro = 'source sans pro',
}

export type FontOptionType = FontOptions[keyof FontOptions];

export type PlaceHolderImageOptions = {
  width: number;
  height: number;
  text?: string;
  isInitial?: boolean;
  font?: FontOptionType;
  format?: 'svg' | 'png' | 'jpeg' | 'gif' | 'webp' | 'avif';
} & (
  | {
      textColor: string;
      backgroundColor: string;
    }
  | {
      textColor?: never;
      backgroundColor?: never;
    }
);

export function buildPlaceholderText(text: string, isInitial?: boolean) {
  if (isInitial) {
    return getInitials(text);
  }
  return text.replace(/\s+/g, '+');
}

export const IMAGE_PLACEHOLDER_DEFAULT_OPTIONS: PlaceHolderImageOptions = {
  width: 400,
  height: 300,
  font: FontOptions.Lato,
  backgroundColor: 'E3ECF6',
  textColor: '1E9DF1',
  format: 'svg',
};

/**
 * Builds a placeholder image URL using the placehold.co service.
 *
 * @param options - Configuration for the placeholder image.
 * @param options.width - Image width in pixels.
 * @param options.height - Image height in pixels.
 * @param options.text - Optional text to display on the image; spaces are replaced with '+'.
 * @param options.font - Optional font family from {@link FontOptions}.
 * @param options.format - Optional output format (svg, png, jpeg, gif, webp, avif); defaults to svg if omitted.
 * @param options.textColor - Optional text color (hex or named color). Must be provided alongside `backgroundColor`.
 * @param options.backgroundColor - Optional background color (hex or named color). Must be provided alongside `textColor`.
 * @returns A fully encoded URL string pointing to the generated placeholder image.
 *
 * @example
 * // Basic usage
 * getPlaceholderImageUrl({ width: 300, height: 200 });
 * // https://placehold.co/300x200
 *
 * @example
 * // With custom text and colors
 * getPlaceholderImageUrl({
 *   width: 400,
 *   height: 300,
 *   text: 'Hello World',
 *   backgroundColor: 'ff0000',
 *   textColor: 'ffffff',
 *   font: FontOptions.Roboto,
 *   format: 'png'
 * });
 * // https://placehold.co/400x300/png/ff0000/ffffff?text=Hello+World&font=roboto
 */
export function createPlaceholderImageUrl(options: PlaceHolderImageOptions) {
  const {
    width,
    height,
    text,
    isInitial,
    font,
    format,
    textColor,
    backgroundColor,
  } = options;

  let url = PLACE_HOLDER_DOMAIN + `${width}x${height}`;
  if (backgroundColor && textColor)
    url += '/' + backgroundColor + '/' + textColor;
  if (format) url += '.' + format;
  if (text || font) {
    url += '?';
    if (text) {
      url += 'text=' + buildPlaceholderText(text, isInitial);
    }
    if (font && text) url += '&font=' + (font as string);
    else if (font && !text) url += 'font=' + (font as string);
  }
  url = encodeURI(url);
  return url;
}
