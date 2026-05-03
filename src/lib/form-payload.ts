import type { EndpointFormMode } from "./form-success";

type PayloadValue = FormDataEntryValue | null;

export function endpointPayloadFromEntries(
  mode: EndpointFormMode,
  entries: Iterable<[string, FormDataEntryValue]>,
): Record<string, PayloadValue> {
  const payload = Object.fromEntries(entries) as Record<string, PayloadValue>;

  if (mode === "task") {
    if (payload.assigneeId === "") {
      payload.assigneeId = null;
    }
    if (payload.dueDate === "") {
      payload.dueDate = null;
    }
  }

  return payload;
}
