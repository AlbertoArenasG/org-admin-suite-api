# Política De Validación

## Criterio de trabajo

Para mantener la agilidad y ahorrar tiempo de desarrollo y revisión,
`org-admin-suite-api` no añade ni ejecuta pruebas automatizadas por defecto.
Esto incluye pruebas unitarias, de integración y e2e. Si la persona usuaria
las pide explícitamente, se acuerda el alcance y se realizan como parte del
trabajo solicitado.

Los comandos y menciones de pruebas heredados de Nest no cambian este criterio.

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

## Pruebas automatizadas

Cuando la persona usuaria solicite pruebas automatizadas para un cambio,
acordar qué comportamiento se verificará y ejecutar solo las necesarias para
ese alcance. Si se decide adoptar una estrategia permanente de pruebas para el
proyecto, documentar en una spec su infraestructura, mantenimiento y criterios
de uso. La presencia de scripts heredados en `package.json` o `README.md` no
implica esa adopción.
