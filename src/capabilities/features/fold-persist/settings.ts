const VALID_ID = /^[\w-]+$/;
/** Retain the legacy per-file boolean map while rejecting malformed persisted data. */
export function normalizeFoldState(
  value: unknown
): Record<string, Record<string, boolean>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([path, snapshot]) => {
      if (
        !snapshot ||
        typeof snapshot !== "object" ||
        Array.isArray(snapshot)
      ) {
        return [];
      }
      return [
        [
          path,
          Object.fromEntries(
            Object.entries(snapshot).filter(
              (entry): entry is [string, boolean] =>
                VALID_ID.test(entry[0]) &&
                !Object.hasOwn(Object.prototype, entry[0]) &&
                typeof entry[1] === "boolean"
            )
          ),
        ],
      ];
    })
  );
}
