# Nikola Đorđević — portfolio

Statični sajt, spreman za GitHub Pages.

1. Napravi repozitorijum (npr. `Portfolio`) i postavi SADRŽAJ ovog foldera u koren repozitorijuma.
2. Settings → Pages → Source: `Deploy from a branch`, grana `main`, folder `/ (root)`.
3. Sajt će biti na `https://veki1.github.io/Portfolio/`.

Ako repozitorijum nazoveš drugačije ili koristiš svoj domen, zameni `https://veki1.github.io/Portfolio/` u svim .html fajlovima, `sitemap.xml` i `robots.txt`.

## Struktura
- `index.html` — početna (hero, radovi, o meni, veštine, usluge, kontakt)
- `radovi/*.html` — studije slučaja za svaki projekat
- `site.css` — zajednički stilovi (fokus, mobilni meni, kartice projekata, veštine, reduced motion)
- `app.js` — jezik (SR/EN) i tema (čuvaju se u `localStorage`), mobilni meni, prelazi između stranica, kontakt forma (`mailto:`), custom kursor

## CV
Ubaci PDF u `assets/` (npr. `assets/nikola-djordjevic-cv.pdf`) i otkomentariši link „Preuzmi CV“ u sekciji „O meni“ u `index.html`.
