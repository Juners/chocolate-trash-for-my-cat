declare global {
  interface Window {
    chrome?: unknown;
  }
}

export interface EmoteData {
  base64: string;
  ratio?: number;
}

export interface Config {
  sizes: {
    space: number;
    emote: number;
  };
  forceBrowser?: BROWSERS;
}

type BROWSERS = "chromium" | "firefox";
const allowedBrowsers: BROWSERS[] = ["chromium", "firefox"];

let detectedBrowser: BROWSERS | undefined;
if (window.chrome || /chrome/i.test(window.navigator.userAgent)) {
  detectedBrowser = "chromium";
} else if (/firefox/i.test(window.navigator.userAgent)) {
  detectedBrowser = "firefox";
}

export const DEFAULT_CONFIG: Config = {
  sizes: {
    emote: 21,
    space: 6.5,
  },
};

export function setupChat<EmoteMap extends { [key: string]: EmoteData }>(
  emoteMap: EmoteMap,
  config: Config = DEFAULT_CONFIG
) {
  type emoteKey = keyof EmoteMap & string;

  type EmojiType = {
    name: string;
    ratio: number;
    str: string;
  };

  const SIZE = config.sizes.emote;
  const SIZE_SPACE = config.sizes.space;

  const browser = config.forceBrowser || detectedBrowser;
  if (!browser || !allowedBrowsers.includes(browser)) {
    console.error(
      "Not supported browser for emotes. If you are positive they will work, use forceBrowser in the config"
    );
  }

  const cachedEmotes: Partial<Record<emoteKey, EmojiType>> = {};

  // let biggestHeight = SIZE;

  function getEmoji(em: emoteKey, modifier: number = 1): EmojiType {
    let cached = cachedEmotes[em];
    if (cached) {
      return cached;
    }

    const emoji = emoteMap[em];
    const url = emoji.base64;
    const ratio = emoji.ratio ?? 1;
    const height = SIZE * modifier;
    const width = SIZE * ratio * modifier;

    const sizeStr =
      browser === "chromium"
        ? `line-height: ${height}px; `
        : `display: inline-flex; height: ${height}px; width: ${width + 10}px; `;

    const str = `color:transparent; ${sizeStr}; background: url('${url}'); background-size: ${width}px; background-repeat: no-repeat;`;

    // if (height > biggestHeight) biggestHeight = height;

    cached = {
      name: em,
      ratio: ("ratio" in emoji ? ratio ?? 1 : 1) * modifier,
      str,
    };

    cachedEmotes[em] = cached;

    return cached;
  }

  return function chat(input: unknown = "") {
    if (typeof input !== "string" || input.trim().length === 0) {
      console.log(input);
      return;
    }

    let format = [];
    let msgs: (string[] | Pick<EmojiType, "ratio" | "name">)[] = [];
    for (const word of input.split(" ")) {
      const emoji = word in emoteMap ? getEmoji(word) : null;

      if (emoji) {
        format.push("%c%s");
        msgs.push([emoji.str], { ratio: emoji.ratio, name: emoji.name });
      } else {
        let last = msgs.pop();
        if (!last || !Array.isArray(last)) {
          if (last && !Array.isArray(last)) msgs.push(last);

          format.push("%c%s");
          msgs.push([""]);
          last = [];
        }

        last.push(word || "");
        msgs.push(last);
      }
    }

    const finalArr = msgs.map((x) =>
      Array.isArray(x)
        ? x.join(" ")
        : new Array(Math.ceil((SIZE * x.ratio) / SIZE_SPACE) + 1).join(" ")
    );

    console.log(format.join(" "), ...finalArr);
  };
}
