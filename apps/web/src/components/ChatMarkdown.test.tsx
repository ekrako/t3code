import { EnvironmentId } from "@t3tools/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";

import ChatMarkdown from "./ChatMarkdown";

vi.mock("@effect/atom-react", () => ({
  useAtomValue: () => ({ availableEditors: [] }),
}));

vi.mock("../hooks/useTheme", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("../editorPreferences", () => ({
  useOpenInPreferredEditor: () => () => {},
}));

vi.mock("../state/assets", () => ({
  assetEnvironment: { createUrl: {} },
}));

vi.mock("../state/entities", () => ({
  useActiveEnvironmentId: () => EnvironmentId.make("environment-local"),
}));

vi.mock("../state/preview", () => ({
  previewEnvironment: { open: {} },
}));

vi.mock("../state/server", () => ({
  serverEnvironment: { configValueAtom: () => ({}) },
}));

vi.mock("../state/session", () => ({
  usePreparedConnection: () => ({ _tag: "None" }),
}));

vi.mock("../state/use-atom-command", () => ({
  useAtomCommand: () => () => {},
}));

vi.mock("../state/use-atom-query-runner", () => ({
  useAtomQueryRunner: () => () => "",
}));

describe("ChatMarkdown bidi list rendering", () => {
  it("renders code-prefixed Hebrew unordered lists as RTL", () => {
    const markup = renderToStaticMarkup(
      <ChatMarkdown
        text={[
          "- **`apps/web`**: אפליקציית React/Vite שמציגה צ'אט",
          "- **`apps/server`**: שרת Node.js שמריץ CLI",
        ].join("\n")}
        cwd={undefined}
      />,
    );

    expect(markup).toContain('<ul dir="rtl">');
    expect(markup).toContain('<li dir="rtl">');
  });

  it("keeps English unordered lists LTR", () => {
    const markup = renderToStaticMarkup(
      <ChatMarkdown
        text={["- README.md", "- apps/server/package.json"].join("\n")}
        cwd={undefined}
      />,
    );

    expect(markup).toContain('<ul dir="ltr">');
    expect(markup).toContain('<li dir="ltr">');
  });

  it("keeps an English parent list LTR when nested list text is RTL", () => {
    const markup = renderToStaticMarkup(
      <ChatMarkdown
        text={[
          "- Parent item",
          "  - שורה בעברית",
          "  - עוד שורה בעברית",
          "- Another parent item",
        ].join("\n")}
        cwd={undefined}
      />,
    );

    expect(markup).toContain('<ul dir="ltr">');
    expect(markup).toContain('<li dir="ltr">Parent item');
    expect(markup).toContain('<ul dir="rtl">');
  });
});
