import sanitizeHtml from 'sanitize-html'

export function sanitizeArticleBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'a', 'ul', 'ol', 'li',
      'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
      'iframe', 'script', 'hr',
    ],
    allowedAttributes: {
      a:          ['href', 'target', 'rel'],
      img:        ['src', 'alt', 'width', 'height', 'style', 'loading'],
      iframe:     ['src', 'width', 'height', 'style', 'scrolling', 'frameborder',
                   'allowfullscreen', 'allow', 'title', 'loading'],
      div:        ['class', 'id', 'style', 'data-embed', 'data-video-id'],
      span:       ['class', 'style'],
      blockquote: ['class', 'cite', 'style',
                   // TikTok
                   'data-video-id',
                   // Instagram
                   'data-instgrm-captioned', 'data-instgrm-permalink', 'data-instgrm-version',
                   // Twitter
                   'data-dnt', 'data-tweet-id', 'data-theme'],
      script:     ['async', 'src', 'charset'],
      td:         ['colspan', 'rowspan'],
      th:         ['colspan', 'rowspan'],
      '*':        [],
    },
    allowedIframeHostnames: [
      // YouTube
      'www.youtube.com',
      'www.youtube-nocookie.com',
      // Vimeo
      'player.vimeo.com',
      // Facebook
      'www.facebook.com',
      // Twitch
      'player.twitch.tv',
      'clips.twitch.tv',
      // Spotify
      'open.spotify.com',
      // Audiomack
      'audiomack.com',
      // Boomplay
      'www.boomplay.com',
    ],
    allowedScriptDomains: [
      'www.tiktok.com',
      'www.instagram.com',
      'platform.twitter.com',
    ],
    allowedScriptHostnames: [
      'www.tiktok.com',
      'www.instagram.com',
      'platform.twitter.com',
    ],
  })
}
