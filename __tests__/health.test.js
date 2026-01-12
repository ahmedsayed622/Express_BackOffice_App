import request from "supertest";
import app from "../src/app.js";

describe("health endpoints", () => {
  it("GET /health returns 200 with JSON", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
  });
});

describe("client monthly data endpoint", () => {
  const hasDbConfig =
    !!process.env.DB_USER &&
    !!process.env.DB_PASSWORD &&
    !!process.env.DB_HOST &&
    !!process.env.DB_PORT &&
    !!process.env.DB_NAME;

  const shouldSkip = !hasDbConfig || process.env.SKIP_DB_TESTS === "true";

  const testFn = shouldSkip ? it.skip : it;
  testFn("GET /api/v1/client-monthly-data returns 200", async () => {
    const res = await request(app).get("/api/v1/client-monthly-data");
    expect(res.status).toBe(200);
  });
});
