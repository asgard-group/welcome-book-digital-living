import type { PropertyData } from "./types";

export const DEFAULT_ARRIVAL_TIME = "15:00";
export const DEFAULT_DEPARTURE_TIME = "11:00";

type QuoteService = NonNullable<PropertyData["services"]>["quote"][number];

/** Repère les services « arrivée anticipée / départ tardif » des logements enregistrés avant la case à cocher. */
export const isStayServiceName = (name: string) => /anticip|tardi/i.test(name);

/**
 * Services « En plus » mis en avant en bas de la page Check-in/out (case à cocher dans l'admin).
 * Tant qu'aucun service n'a été coché ou décoché, on retombe sur la détection par le nom.
 */
export function stayServices(quote: QuoteService[] | undefined): QuoteService[] {
  const list = quote ?? [];
  const configured = list.some((s) => s.stayLink !== undefined);
  return list.filter((s) => (configured ? s.stayLink : isStayServiceName(s.name.fr)));
}
