import { describe, it, expect } from "vitest";
import { parseArxivFeed } from "./arxiv";

const feedWithoutJournalRef = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom">
  <entry>
    <id>http://arxiv.org/abs/2403.05794v2</id>
    <title>Privacy-Preserving Diffusion Model Using Homomorphic Encryption</title>
    <link href="https://arxiv.org/abs/2403.05794v2" rel="alternate" type="text/html"/>
    <summary>We introduce a privacy-preserving stable diffusion framework called HE-Diffusion.</summary>
    <published>2024-03-09T04:56:57Z</published>
    <author>
      <name>Yaojian Chen</name>
    </author>
    <author>
      <name>Qiben Yan</name>
    </author>
  </entry>
</feed>`;

describe("parseArxivFeed", () => {
  it("학회 정보가 없는 논문은 preprint로 표시한다", () => {
    const papers = parseArxivFeed(feedWithoutJournalRef);

    expect(papers).toHaveLength(1);
    expect(papers[0]).toEqual({
      id: "2403.05794v2",
      title: "Privacy-Preserving Diffusion Model Using Homomorphic Encryption",
      authors: ["Yaojian Chen", "Qiben Yan"],
      publishedAt: "2024-03-09",
      abstract:
        "We introduce a privacy-preserving stable diffusion framework called HE-Diffusion.",
      url: "https://arxiv.org/abs/2403.05794v2",
      venue: "preprint",
    });
  });
});
