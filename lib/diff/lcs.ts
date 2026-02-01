export function lcs<T>(a: T[], b: T[], equals: (x: T, y: T) => boolean) {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (equals(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

export function backtrackLcs<T>(
  a: T[],
  b: T[],
  equals: (x: T, y: T) => boolean
) {
  const dp = lcs(a, b, equals);
  const result: Array<{ type: "equal" | "delete" | "insert"; value: T }> = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && equals(a[i - 1], b[j - 1])) {
      result.unshift({ type: "equal", value: a[i - 1] });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "insert", value: b[j - 1] });
      j -= 1;
    } else if (i > 0) {
      result.unshift({ type: "delete", value: a[i - 1] });
      i -= 1;
    }
  }
  return result;
}
