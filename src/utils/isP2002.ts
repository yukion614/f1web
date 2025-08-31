function isP2002(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err != null &&
    "code" in err &&
    (err as any).code === "P2002"
  );
}

export default isP2002;
