export type EndpointFormMode = "login" | "signup" | "project" | "task";

const messageByMode: Record<EndpointFormMode, string> = {
  login: "Logged in. Opening your dashboard...",
  signup: "Account created. Opening your dashboard...",
  project: "Request sent to the app REST endpoint.",
  task: "Request sent to the app REST endpoint.",
};

export function successMessageForMode(mode: EndpointFormMode): string {
  return messageByMode[mode];
}

export function successRedirectForMode(mode: EndpointFormMode): string | null {
  return mode === "login" || mode === "signup" ? "/dashboard" : null;
}
