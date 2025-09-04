function isP2025(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err != null &&
    "code" in err &&
    (err as any).code === "P2025"
  );
}

export default isP2025;
