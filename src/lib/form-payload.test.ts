import { describe, expect, it } from "vitest";
import { endpointPayloadFromEntries } from "./form-payload";

describe("endpoint payload normalization", () => {
  it("converts empty task assignee and due date fields to null", () => {
    const payload = endpointPayloadFromEntries("task", [
      ["title", "Prepare review"],
      ["description", ""],
      ["status", "todo"],
      ["priority", "medium"],
      ["assigneeId", ""],
      ["dueDate", ""],
    ]);

    expect(payload).toMatchObject({ assigneeId: null, dueDate: null });
  });

  it("keeps selected task assignee and due date values intact", () => {
    const payload = endpointPayloadFromEntries("task", [
      ["title", "Prepare review"],
      ["assigneeId", "7efbf021-9cb0-47f4-acf7-a87794455f53"],
      ["dueDate", "2026-05-10"],
    ]);

    expect(payload).toMatchObject({
      assigneeId: "7efbf021-9cb0-47f4-acf7-a87794455f53",
      dueDate: "2026-05-10",
    });
  });
});
