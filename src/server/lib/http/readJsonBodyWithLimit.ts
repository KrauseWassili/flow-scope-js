export function readJsonBodyWithLimit(
  req: any,
  limitBytes: number,
  timeoutMs: number
): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("body_timeout"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      req.removeAllListeners("data");
      req.removeAllListeners("end");
      req.removeAllListeners("error");
      req.removeAllListeners("aborted");
    }

    req.on("aborted", () => {
      cleanup();
      reject(new Error("aborted"));
    });

    req.on("error", (err: any) => {
      cleanup();
      reject(err);
    });

    req.on("data", (chunk: any) => {
      size += chunk.length;
      if (size > limitBytes) {
        cleanup();
        reject(new Error("body_too_large"));
        try { req.destroy(); } catch {}
        return;
      }
      body += chunk.toString("utf8");
    });

    req.on("end", () => {
      cleanup();
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
  });
}
