# Progress

## 2026-08-10

- Se creó la spec `contacts-and-recipient-groups`.
- Se aterrizó la primera decisión de definición:
  - `contacts` será el catálogo base general y reutilizable
  - `recipient-groups` será el módulo consumidor que agrupa contactos para usos operativos
- Se aterrizó la segunda decisión de definición:
  - `v1` nacerá ya como modelo multicanal
  - existirá catálogo de canales desde el inicio
  - por ahora solo `EMAIL` estará habilitado operativamente
  - `recipient-groups` definirá canales habilitados por grupo
  - `contacts` guardará identidad reusable y address values por canal
  - el uso efectivo se resolverá por intersección entre grupo y contacto
- Se aterrizó la tercera decisión de definición:
  - `recipient-groups` consumirá `contacts` reutilizables como modelo principal
  - no se modelarán destinatarios embebidos por grupo como base del diseño
  - el diseño queda listo para búsqueda, autocomplete y reutilización transversal de contactos
- Se aterrizó la cuarta decisión de definición:
  - los usuarios internos generarán automáticamente su registro correspondiente en `contacts`
  - `contacts` soportará desde `v1` contactos vinculados a usuarios internos y contactos externos
  - la iniciativa deberá contemplar migración o seed para generar `contacts` de los usuarios ya existentes
  - los contactos auto-generados desde usuarios internos usarán `ICSACV` como `companyName` inicial
- Se aterrizó la quinta decisión de definición:
  - `contacts` nacerá con modelo preparado para multiplicidad en datos de contacto
  - `emails[]`, `phones[]` y `cellPhones[]` existirán desde `v1` como colecciones en el modelo
  - `companyName` formará parte del shape mínimo
  - `fullName` se tratará como dato derivado
