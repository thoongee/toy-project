import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("@/app/actions", () => ({ askAboutSituation: vi.fn() }));

import Home from "@/app/page";

test("홈 화면은 상황을 적는 입력과 찾기 버튼을 보여준다", () => {
  render(<Home />);

  expect(screen.getByLabelText(/지금 하려는 일/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /논문 찾기/ })).toBeInTheDocument();
});
