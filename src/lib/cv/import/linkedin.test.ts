import { describe, expect, it } from "vitest";
import { cleanLinkedInUrl, linkedInText } from "./linkedin";

describe("Import from LinkedIn", () => {
  it("reads only what the person pasted, with their profile link as a contact link", () => {
    const pasted = "About\nI run paid search for retail brands.\n\nExperience\nPaid Media Manager\nNorthlight Agency\nMar 2021 – Present";
    expect(linkedInText("https://www.linkedin.com/in/maya-chen-ppc/", pasted)).toBe(`linkedin.com/in/maya-chen-ppc\n\n${pasted}`);
    expect(linkedInText("", pasted)).toBe(pasted);
  });

  it("fills nothing in: with no pasted profile there is nothing to read, and the person is asked for the PDF or the text", () => {
    expect(linkedInText("linkedin.com/in/maya-chen-ppc", "")).toBeNull();
    expect(linkedInText("linkedin.com/in/maya-chen-ppc", "Paid media")).toBeNull();
  });

  it("keeps only a real profile link: anything else is not a LinkedIn profile and is not used", () => {
    expect(cleanLinkedInUrl("uk.linkedin.com/in/fern-example")).toBe("linkedin.com/in/fern-example");
    expect(cleanLinkedInUrl("http://169.254.169.254/latest?x=linkedin.com/in/a")).toBe("");
    expect(cleanLinkedInUrl("https://evil.example/linkedin.com/in/a")).toBe("");
  });
});
