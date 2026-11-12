import { describe, it, expect } from "vitest";
import { pageText, menuText } from "./texts";
import type { PropertyData } from "./types";

const base = { texts: {
  pages: { checkout: { title: { fr: "Arrivée & départ", en: "Arrival & departure" }, subtitle: { fr: "  ", en: "" } } },
  menu: { explore: { fr: "Sortir", en: "" } },
} } as unknown as PropertyData;

describe("textes personnalisés", () => {
  it("utilise le texte personnalisé dans la langue courante", () => {
    expect(pageText(base, "checkout", "title", "en", "Check-in/out")).toBe("Arrival & departure");
    expect(pageText(base, "checkout", "title", "fr", "Check-in/out")).toBe("Arrivée & départ");
  });
  it("retombe sur le défaut si vide ou absent", () => {
    expect(pageText(base, "checkout", "subtitle", "fr", "défaut")).toBe("défaut");
    expect(pageText(base, "services", "title", "fr", "Services")).toBe("Services");
    expect(pageText(undefined, "services", "title", "fr", "Services")).toBe("Services");
  });
  it("retombe sur le français si l'anglais n'est pas encore traduit", () => {
    expect(menuText(base, "explore", "en", "Explore")).toBe("Sortir");
  });
});
