/**
 * Shape of a single building's guest-facing data.
 *
 * One JSON document per building lives at `public/buildings/<id>.json` and is
 * fetched at runtime (see PropertyContext). Keep this in sync with those files.
 */
export type PropertyData = {
  /** Stable building identifier; matches the `/buildings/<id>.json` filename. */
  id: string;
  /** Public-facing building / property name (shown on the welcome screen). */
  name: string;
  wifi: {
    network: string;
    password: string;
  };
  entryCodes: {
    /** Street door / building entrance keypad code. */
    buildingDoor: string;
    /** Hall access code, entered on the intercom after the street door. */
    hallCode: string;
  };
  /** epoch ms when access ends; sent by the API so the client can expire values offline. */
  validUntil?: number;
};
