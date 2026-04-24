# Neon Loop Station 3.0 MIDI Pads

Wgraj katalog na serwer PHP i otwórz `index.php`.

## Nowości
- zapis/wczytywanie całych projektów w localStorage i przez `save_project.php`,
- zapis/wczytywanie kitów/padów, eksport/import `neon-kit.json`,
- bank ponad 25 brzmień syntetycznych do przypisywania padom,
- przypisywanie własnych klawiszy komputera do padów,
- nagrywanie mikrofonu, trim start/koniec, reverse, normalize, crop, pitch, gain,
- przypisanie nagrania do wybranego pada i auto-chop na pady 9-16,
- Web MIDI: obsługa kontrolerów USB MIDI, np. M-Audio Keystation Mini 32.

## MIDI
Web MIDI działa najlepiej w Chrome/Edge. Strona musi być uruchomiona przez HTTPS albo lokalnie (`localhost`). Podłącz klawiaturę USB, kliknij „Połącz MIDI” i wybierz tryb grania.

## Uwaga
Próbki zapisane w kitach są kodowane do JSON, więc bardzo długie nagrania mogą robić duże pliki. Do padów najlepiej używać krótkich sampli.


## 4.1 Live MIDI Piano
- Aktywne nuty MIDI i nuty z klawiatury komputera świecą na pianinie.
- Zmiana oktawy −/+ aktualizuje zakres nut i przesuwa wizualny pasek pianina.
- Dodano dużo więcej brzmień padów: kicki, werble, hihaty, perkusjonalia, basy, pianina, chordy, pady, leady, FX i vox.
- Dodano więcej instrumentów MIDI, w tym zwykłe Grand Piano, Soft Piano i Bright Piano.
