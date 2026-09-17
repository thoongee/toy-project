import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("next/font/google", () => {
  const font = () => ({ variable: "", className: "", style: { fontFamily: "" } });
  return {
    Geist: font,
    Geist_Mono: font,
    Inter: font,
    Roboto_Slab: font,
    Public_Sans: font,
  };
});

import RootLayout from "@/app/layout";

test("공통 shell은 찾기와 노트로 가는 링크를 보여준다", () => {
  render(<RootLayout params={Promise.resolve({})}>{null}</RootLayout>);

  expect(screen.getByRole("link", { name: "찾기" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "노트" })).toHaveAttribute("href", "/note");
});
