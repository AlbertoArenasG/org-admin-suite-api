# Handoff Frontend: Carga De ZIP De Service Packages

## Contrato vigente

```text
POST /v1/service-packages/uploads?origin=backoffice
Content-Type: multipart/form-data
Campo de archivo: package (un ZIP)
```

`origin` es opcional y solo se usa en el correo de observabilidad. La PWA
actual no lo envia; el backoffice debe enviar `backoffice`. No es una prueba
de identidad ni una autorizacion. El endpoint no usa `JwtAuthGuard` ni
`PermissionsGuard`; su acceso publico es una decision operativa vigente. La
vista administrativa de listado, por separado, exige `SERVICE_PACKAGES.READ`.

No hay limite de tamano declarado en el `FileInterceptor` de este endpoint. El
frontend no debe asumir que eso elimina posibles limites de infraestructura.

## Respuesta confirmada

HTTP 201 con envelope estandar:

```json
{
  "success": true,
  "success_message": "Paquete de servicios procesado correctamente",
  "status_code": 201,
  "data": {
    "package_id": "6TXbOoveVWXMYbi5",
    "services": [
      {
        "record_id": "dOxevh3gGREuY6W7",
        "service_order": "002",
        "file_count": 7
      }
    ]
  }
}
```

`services.length` es el numero de registros confirmados por esa respuesta.
Los campos `service_order` y `record_id` permiten presentar el detalle al
operador. No interpretar el mero estado HTTP 2xx sin envelope valido como
confirmacion de registros.

## Fallos Y Reintentos

- Un error HTTP con respuesta del servidor usa el envelope de error comun.
  El procesamiento recorre servicios uno por uno: antes de un error pueden
  haberse persistido registros parciales.
- Si la red se corta, el navegador no puede distinguir si el backend nunca
  recibio el ZIP, si lo proceso parcialmente o si perdio la respuesta.
- No hay idempotencia ni estado de intento consultable desde este contrato.
  No reintentar automaticamente ni afirmar que una respuesta ausente implica
  que no hubo carga. Revisar el listado antes de repetirla.
- El correo de observabilidad informa el resultado que pudo observar el
  backend, pero no constituye una respuesta sincronica para el navegador.

## Compatibilidad

La PWA conserva la misma URL sin `origin`. Incorporar el consumidor
administrativo no requiere modificar este endpoint ni la PWA.
