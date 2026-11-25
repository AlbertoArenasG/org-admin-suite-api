# Plan

1. Cerrar contrato y artefactos de consulta del portal.
2. Implementar lectura por periodo en el pipeline propio de client access: DTO → controller → query/handler → caso de uso → puerto/repositorio → mapper → presenter.
3. Registrar el endpoint en Nest/CQRS, handoff y Postman.
4. Compilar, revisar lint y diff; dejar matriz manual al usuario. El frontend se trabaja después de esa validación.
