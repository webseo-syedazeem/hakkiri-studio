import { afterEach, describe, expect, it, vi } from "vitest";

const addresses = new Map<string, string>();
vi.mock("node:dns/promises", () => ({
  lookup: async (host: string) => {
    const a = addresses.get(host);
    if (!a) throw new Error("ENOTFOUND");
    return [{ address: a, family: a.includes(":") ? 6 : 4 }];
  },
}));

const { isPrivateAddress, readLink } = await import("./links");

const page = (words: number) => `<html><head><title>Acme</title></head><body><p>${"Acme makes payroll software for small firms. ".repeat(words / 7)}</p></body></html>`;

afterEach(() => {
  vi.unstubAllGlobals();
  addresses.clear();
});

describe("reading links safely", () => {
  it("knows private addresses", () => {
    for (const ip of ["127.0.0.1", "10.2.3.4", "192.168.1.1", "172.20.0.1", "169.254.169.254", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "0.0.0.0"]) expect(isPrivateAddress(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "104.18.2.3", "2606:4700::1111"]) expect(isPrivateAddress(ip), ip).toBe(false);
  });

  it("refuses a public name that points at this computer", async () => {
    addresses.set("sneaky.example.com", "127.0.0.1");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await readLink("sneaky.example.com", "company");
    expect(r.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("won't follow a redirect into a private network", async () => {
    addresses.set("acme.example.com", "93.184.216.34");
    const fetchMock = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://169.254.169.254/latest/meta-data" } }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await readLink("acme.example.com", "company");
    expect(r.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("follows an ordinary redirect to a public page", async () => {
    addresses.set("acme.example.com", "93.184.216.34");
    addresses.set("www.acme.example.com", "93.184.216.34");
    const fetchMock = vi.fn(async (u: URL | string) =>
      String(u).includes("www.") ? new Response(page(400), { status: 200, headers: { "content-type": "text/html" } }) : new Response(null, { status: 301, headers: { location: "https://www.acme.example.com/" } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const r = await readLink("acme.example.com", "company");
    expect(r.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reads only the first 2 MB of a huge page", async () => {
    addresses.set("big.example.com", "93.184.216.34");
    let sent = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        if (sent > 50_000_000) return c.close();
        const chunk = new TextEncoder().encode("<p>" + "word ".repeat(20_000) + "</p>");
        sent += chunk.byteLength;
        c.enqueue(chunk);
      },
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(stream, { status: 200, headers: { "content-type": "text/html" } })));
    const r = await readLink("big.example.com", "company");
    expect(sent).toBeLessThan(3_000_000);
    expect(r.ok).toBe(true);
  });
});
