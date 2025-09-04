function isP2003(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err != null &&
    "code" in err &&
    (err as any).code === "P2003"
  );
}

export default isP2003;
