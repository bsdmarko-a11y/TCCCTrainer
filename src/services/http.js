// Jedino mjesto koje zove fetch. Servisi iznad znaju samo putanju i metodu.
//
// Adresa posluzitelja dolazi iz .env datoteke (VITE_API_URL); u razvoju je to
// json-server pokrenut s `npm run server`.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // fetch baca samo kad zahtjev uopce nije stigao do posluzitelja.
    throw new Error(
      "The data server could not be reached. Start it with: npm run server",
      { cause: error },
    );
  }

  // 404 nije greska nego odgovor: zapis ne postoji.
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`The data server answered with an error (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}
