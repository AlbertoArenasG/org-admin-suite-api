# Política De Validación

## Estado Vigente

Hasta nuevo acuerdo explícito, `org-admin-suite-api` no trabaja pruebas
unitarias. Ninguna sesión o agente debe crear, proponer o ejecutar suites
unitarias por defecto al implementar una iniciativa.

Los comandos y menciones de pruebas heredados de Nest no constituyen una norma
del proyecto.

## Evidencia Requerida Por Cambio

Cada spec define antes de implementar la evidencia proporcional a su riesgo:

- compilación o verificación estática aplicable;
- validación manual de contrato, persistencia o comportamiento observable;
- Postman y handoff cuando cambie una API consumida por otro repositorio;
- comandos operativos ejecutados exclusivamente por la persona usuaria cuando
  afecten datos, seeds, migraciones, procesos o entornos.

La persona usuaria ejecuta la validación manual. El agente documenta los
escenarios y solicita confirmación, pero no ejecuta ni supone esa validación.
Tras la confirmación, la evidencia se registra en la spec:

- `03-task-list.md`: tarea marcada y criterio o evidencia de cierre;
- `05-progress.md`: fecha, escenarios confirmados y cualquier limitación;
- `08-manual-validation.md`: cuando una matriz de escenarios o preparación
  manual independiente aporte claridad.

La validación manual no se infiere ni se marca como realizada sin confirmación
de la persona usuaria.

## Cambio De Política

Incorporar pruebas unitarias, integración o e2e requiere una decisión explícita
de la persona usuaria y una spec que defina alcance, infraestructura,
mantenimiento y criterios de adopción. No se activa por la presencia de scripts
heredados en `package.json` o `README.md`.
