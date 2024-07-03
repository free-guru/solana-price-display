export * from "./token";

export const sleep = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const ensureSeconds = (timestamp: number) => {
  return timestamp.toString().length === 13
    ? Math.floor(timestamp / 1000)
    : timestamp;
};
