import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { askAboutSituation } from "./actions";

describe("askAboutSituation", () => {
  it("상황이 비어 있으면 검색하지 않고 오류를 돌려준다", async () => {
    const formData = new FormData();
    formData.set("situation", "   ");

    const state = await askAboutSituation({ status: "idle" }, formData);

    expect(state.status).toBe("error");
  });
});
