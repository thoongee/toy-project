import { describe, it, expect } from "vitest";
import { curatePapers } from "./curation";

describe("curatePapers", () => {
  it("후보 논문이 없으면 모델을 호출하지 않고 빈 결과를 낸다", async () => {
    await expect(curatePapers("DLLM을 동형암호로 구현하려고 합니다", [])).resolves.toEqual([]);
  });
});
