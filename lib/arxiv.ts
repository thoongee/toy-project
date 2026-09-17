export type ArxivPaper = {
  id: string;
  title: string;
  authors: string[];
  publishedAt: string;
  abstract: string;
  url: string;
  venue: string;
};

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function readTag(entry: string, tag: string): string {
  const match = entry.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  if (!match) return "";
  return decodeXmlEntities(match[1].replace(/\s+/g, " ").trim());
}

const ARXIV_ENDPOINT = "https://export.arxiv.org/api/query";

export async function searchArxiv(query: string, maxResults = 12): Promise<ArxivPaper[]> {
  const url = new URL(ARXIV_ENDPOINT);
  url.searchParams.set("search_query", query);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(maxResults));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    throw new Error(`arXiv 검색에 실패했습니다 (HTTP ${response.status})`);
  }

  return parseArxivFeed(await response.text());
}

export function dedupePapers(groups: ArxivPaper[][]): ArxivPaper[] {
  const seen = new Map<string, ArxivPaper>();
  for (const paper of groups.flat()) {
    if (!seen.has(paper.id)) seen.set(paper.id, paper);
  }
  return [...seen.values()];
}

export function parseArxivFeed(xml: string): ArxivPaper[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries.map((entry) => {
    const id = readTag(entry, "id").replace(/^https?:\/\/arxiv\.org\/abs\//, "");
    const authors = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((match) =>
      decodeXmlEntities(match[1].trim()),
    );
    const alternateLink = entry.match(/<link href="([^"]+)"[^>]*rel="alternate"/);
    const journalRef = readTag(entry, "arxiv:journal_ref");

    return {
      id,
      title: readTag(entry, "title"),
      authors,
      publishedAt: readTag(entry, "published").slice(0, 10),
      abstract: readTag(entry, "summary"),
      url: alternateLink ? alternateLink[1] : `https://arxiv.org/abs/${id}`,
      venue: journalRef || "preprint",
    };
  });
}
