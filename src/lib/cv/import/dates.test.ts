import { describe, expect, it } from "vitest";
import { findDates, isOnlyDates, withoutDates, withoutDurations } from "./dates";

const read = (text: string) => {
  const d = findDates(text);
  return d ? `${d.start}|${d.current ? "now" : d.end}${d.single ? "|single" : ""}${d.approx ? "|approx" : ""}` : null;
};

describe("reading dates from a CV line", () => {
  it.each([
    ["Mar 2021 – Present", "2021-03|now"],
    ["March 2021 - present", "2021-03|now"],
    ["Jun 2018 – Feb 2021", "2018-06|2021-02"],
    ["Sept 2019 – to date", "2019-09|now"],
    ["September 2019 to date", "2019-09|now"],
    ["January 2020 – Present · Bristol", "2020-01|now"],
    ["2016 - 2018", "2016|2018"],
    ["2016–18", "2016|2018"],
    ["2019/20", "2019|2020"],
    ["2019/2020", "2019|2020"],
    ["05/2021 – Present", "2021-05|now"],
    ["08/2018 – 04/2021", "2018-08|2021-04"],
    ["2018-08 to 2021-04", "2018-08|2021-04"],
    ["(2022 to now)", "2022|now"],
    ["Since 2019", "2019|now"],
    ["from 2019", "2019|now"],
    ["April 2021 - Present (3 years 8 months)", "2021-04|now"],
    ["September 2022 – Expected June 2025", "2022-09|2025-06"],
    ["May '19 – Aug '21", "2019-05|2021-08"],
    ["May 21, 2020 – June 3, 2021", "2020-05|2021-06"],
    ["Dec. 2019 – Jan. 2021", "2019-12|2021-01"],
    ["June 2020 until now", "2020-06|now"],
    ["2020 – ongoing", "2020|now"],
  ])("%s", (text, expected) => expect(read(text)).toBe(expected));

  it.each([
    ["2020", "2020|2020|single"],
    ["(2021, seven months)", "2021|2021|single"],
    ["Graduated June 2019", "2019-06|2019-06|single"],
  ])("a single date: %s", (text, expected) => expect(read(text)).toBe(expected));

  it("keeps a year as a year: no month is guessed", () => {
    expect(findDates("2016 – 2018")).toMatchObject({ start: "2016", end: "2018" });
  });

  it("a season keeps only the year and is marked for checking", () => {
    expect(read("Summer 2024")).toBe("2024|2024|single|approx");
    expect(read("Autumn 2019 – Spring 2021")).toBe("2019|2021|approx");
  });

  it("a day and month that can be read two ways keeps only the year and is marked for checking", () => {
    expect(read("01/09/2019 – 05/06/2021")).toBe("2019|2021|approx");
    // 25 cannot be a month, so this one is certain.
    expect(read("25/09/2019 – 30/06/2021")).toBe("2019-09|2021-06");
    expect(read("09/25/2019 – 06/30/2021")).toBe("2019-09|2021-06");
  });

  it.each(["Managed a team of 12", "Grew revenue by £2020k", "Call 020 7946 0123", "Saved 2,019 hours", "Budget of 2025.50", "No dates here"])("finds no date in: %s", (text) => expect(findDates(text)).toBeNull());

  it("takes the dates out of a line, with their brackets and any duration", () => {
    const line = "Analyst, Brightline Energy (2022 to now)";
    expect(withoutDates(line, findDates(line)!)).toBe("Analyst, Brightline Energy");
    const tabbed = "Paid Media Manager, Northlight Agency  Mar 2021 – Present";
    expect(withoutDates(tabbed, findDates(tabbed)!)).toBe("Paid Media Manager, Northlight Agency");
    const li = "April 2021 - Present (3 years 8 months)";
    expect(withoutDates(li, findDates(li)!)).toBe("");
    const mid = "2013 – 2017 B.A. in Cognitive Science";
    expect(withoutDates(mid, findDates(mid)!)).toBe("B.A. in Cognitive Science");
    const lead = "BSc Economics, graduated 2019";
    expect(withoutDates(lead, findDates(lead)!)).toBe("BSc Economics");
  });

  it("recognises a line that is only dates", () => {
    expect(isOnlyDates("Jun 2018 – Feb 2021")).toBe(true);
    expect(isOnlyDates("April 2021 - Present (3 years 8 months)")).toBe(true);
    expect(isOnlyDates("2020")).toBe(true);
    expect(isOnlyDates("Analyst 2020")).toBe(false);
    expect(isOnlyDates("Excel")).toBe(false);
  });

  it("removes durations without leaving pieces behind", () => {
    expect(withoutDurations("Kestrel Sportswear (5 years 2 months)")).toBe("Kestrel Sportswear");
    expect(withoutDurations("5 years 2 months")).toBe("");
    expect(withoutDurations("2 yrs 3 mos")).toBe("");
    expect(withoutDurations("seven months")).toBe("");
  });
});
