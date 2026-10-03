import sanitizeHtml from "sanitize-html";

const URL_RE = /https?:\/\/[^\s<]+/g;

function linkifyTextSegment(segment: string): string {
  return segment.replace(URL_RE, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

export function linkifyHtmlText(html: string): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : linkifyTextSegment(part)))
    .join("");
}

export function sanitizeRichHtml(rawHtml: string): string {
  return sanitizeHtml(linkifyHtmlText(rawHtml), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "mark", "u"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      li: ["style"],
      div: ["style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
