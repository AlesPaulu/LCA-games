LCA hry – statická webová aplikace
==================================

Obsah složky:
  index.html   – česká verze (výchozí adresa)
  en/index.html – anglická verze (adresa .../en/)
  style.css    – vzhled
  data.js      – OBSAH HER: texty (CZ/EN), kartičky, správná řešení, otázky „Co když…?“
  app.js       – logika (přetahování, kontrola, nápověda)
  img/         – logo a fotografie (fotky jsou zatím vyříznuté z předloh v nízké kvalitě)

Adresy jazykových verzí:
  https://.../            – čeština
  https://.../en/         – angličtina
  Přepínač CZ/EN v rohu aplikace mezi nimi přepíná a adresa se změní.
  Funguje i parametr ?lang=en, např. https://.../?lang=en

Nasazení na web ústavu:
  Celou složku „web“ nahrajte na server (např. do podsložky /lca-hry/) a otevřete index.html.
  Nepotřebuje žádný server-side kód ani databázi. Jediná externí závislost je font Inter
  z Google Fonts – bez připojení se použije systémové písmo.

Lokální vyzkoušení:
  V terminálu ve složce „web“ spusťte:  python3 -m http.server 8000
  a otevřete http://localhost:8000

Výměna fotografií za kvalitnější:
  Stačí nahradit soubory v img/ (stejné názvy, ideálně čtvercové JPG cca 400×400 px).

Úprava textů a řešení:
  Vše je v data.js (česky i anglicky vedle sebe).
  Soubory index.html a en/index.html jsou stejné; liší se jen titulkem stránky
  a atributy data-lang / data-other na značce <html>.
