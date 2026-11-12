# ChatGPT Ads: reserva y WhatsApp conectados, desactivados

Estado local: el aviso de privacidad conecta con la integración de servidor.
Se mantienen los botones «Aceptar» y «Rechazar», y el enlace inferior
«Preferencias de privacidad». La imagen Docker y el despliegue ya incluyen el worker. No se ha desplegado ni activado nada en producción.

## Activación y preview

```dotenv
CHATGPT_ADS_ENABLED=false
CHATGPT_ADS_PIXEL_ID=
CHATGPT_ADS_CAPI_KEY=
CHATGPT_ADS_VALIDATE_ONLY=true
```

Las credenciales por sí solas no activan la integración. Se requiere además
`CHATGPT_ADS_ENABLED=true` en app y worker. La clave CAPI es privada, específica
de la fuente de JimBoats; no es una clave de modelos ni la del complemento.
`PUBLIC_SITE_URL` debe ser una URL HTTP(S) absoluta.

Con la integración desactivada no se capturan referencias, no se crea metadata
publicitaria en Stripe, no se encolan eventos y no se abre la base de datos desde
las funciones de medición. El worker sale sin iniciar servicios externos.
El aviso solo aparece como preview en `JIMBOATS_LOCAL_BOOKINGS=1` o
`JIMBOATS_SEO_PREVIEW=1`. Esa preview utiliza `sessionStorage` con una clave
separada y **nunca se reutiliza como consentimiento real**. El script de arranque
local fuerza Ads y Statsig desactivados, aunque herede credenciales del shell.
La configuración previa de Statsig de producción no se modifica en este cambio.

## Consentimiento y atribución

- Cuando Ads esté habilitado, el aviso aparecerá al entrar en `/[locale]/book`.
  Antes de aceptar, no captura ni almacena `oppref`, ni contacta con OpenAI.
- Al aceptar, lee `oppref` de la URL de reserva y lo envía únicamente al servidor
  propio. Lo conserva sin normalizar ni truncar (máximo 500 caracteres; si no
  es válido, se omite la atribución). No guarda ese identificador en el navegador.
- Una tabla `ads_measurement_consents` guarda versión, referencia del clic y
  fechas de aceptación, caducidad y retirada. No guarda identidad ni contacto.
  La cookie `jimboats_ads_consent_v1` contiene solo una referencia aleatoria del
  servidor o `denied-v1`; es HttpOnly, SameSite=Lax, Secure en producción, ruta `/`.
- La elección y la atribución caducan a las 24 horas. El worker purga los registros
  caducados cada hora mientras está activo. Si se desactiva permanentemente,
  deberán purgarse esos registros operativamente; no hay un purgador separado.
- Rechazar funciona directamente. Retirar el permiso desde las preferencias
  revoca el registro y borra su `oppref`. El worker vuelve a consultar el permiso
  antes de cada envío/reintento. Los pendientes con permiso retirado o caducado
  quedan FAILED. No se puede retirar una petición ya enviada o en vuelo.
- Volver a aceptar crea otro registro; no reactiva eventos anteriores. Guardar
  preferencias sin cambios conserva el permiso de un pago ya iniciado.
- Fallos de medición nunca impiden reservar ni abrir WhatsApp. Si falla el guardado
  de la elección, el aviso permite reintentar y el navegador no emite eventos nuevos.

**Alcance de atribución:** esta primera versión solo recoge la referencia presente
al aceptar en la URL de reserva. Para la primera campaña, usar como destino una
URL de reserva válida, por ejemplo `/es/book?experience=daytrip&hours=2`, y comprobar
que el anuncio añade `oppref`. No añadir un valor inventado ni copiar uno entre
clientes. Si el anuncio llega a marketing y el identificador se pierde al navegar,
no se atribuirá la reserva. No se añaden almacenamiento previo al permiso ni
seguimiento global de navegación. Una elección ya guardada no importa referencias
nuevas automáticamente. Sin `oppref` válido no se envían eventos en esta versión;
no implementa atribución por visualización ni coincidencia por email/teléfono.

## Eventos

### Reserva pagada

1. La Server Action consulta el permiso del servidor mediante su cookie; no confía
   en un booleano o importe publicitario enviado por el cliente.
2. Stripe recibe únicamente el ID interno de consentimiento en metadata. No recibe
   `oppref` adicional. El webhook debe tener firma válida y `payment_status=paid`.
   También se admite `checkout.session.async_payment_succeeded`.
3. Tras validar importe y moneda, la misma transacción que confirma la reserva
   encola `ChatGptOrderCreated`, agregado `ADS_CONVERSION`.
4. Se envía `order_created` una vez por reserva con el primer importe online
   efectivamente cobrado: señal o total, después de descuentos. El importe está
   en céntimos. No se suma el saldo pendiente ni pagos posteriores a bordo.
5. El ID `booking_<id>_paid` se conserva en reintentos. El worker obtiene `oppref`
   solo al enviar, desde el registro de consentimiento vigente. No está duplicado
   en metadata de Stripe, eventos del proveedor o mensajes de la cola.

### WhatsApp dentro de la reserva

`BookingWhatsAppHelp` registra únicamente el clic de los enlaces del flujo de
reserva, sin retrasar la apertura de WhatsApp. No mide botones de marketing.
Se envía `type=custom`, `custom_event_name=booking_whatsapp_clicked`, `data.type=custom`,
sin importe. **No significa que el cliente haya enviado un mensaje o reservado.**
Una inserción idempotente limita el evento a un clic por registro de consentimiento,
aunque se pulse varias veces o desde los dos botones del flujo.

Ambos eventos usan `opt_out=true`, una URL limpia y el Pixel ID fijado al encolarlos.
No se envían nombres, email, teléfono, IP, user-agent, tokens de reserva ni parámetros.
El identificador de clic es dato de atribución, no una estadística anónima.

## Base de datos y worker

La migración `20261112081757_booking_ads_consent` añade exclusivamente la tabla
de consentimiento y su índice de caducidad. Se ha aplicado solo a PostgreSQL local
(`127.0.0.1:55439`, `jimboats_hourly_preview`). Aplicar la migración en despliegue
antes de habilitar la integración. No se ejecuta al arrancar Next.js.

```sh
pnpm ads:worker
```

El comando requiere variables ya cargadas. La imagen compila `.worker/ads-conversion-worker.cjs`.
El servicio `ads-conversion-worker` está definido en Compose bajo el perfil
`advertising`, con reinicio automático y las mismas variables Ads que la app.
`infra/deploy/deploy.sh` comprueba las credenciales si se solicita activar, detiene
el worker anterior, aplica migraciones y lo inicia tras recrear la app únicamente
si `CHATGPT_ADS_ENABLED=true`. Si es false, lo deja detenido: no entra en un ciclo
de reinicios. No hace falta arrancarlo a mano ni habilitar el perfil en GitHub.
CI valida también este servicio. La clave CAPI solo llega a app y worker Ads.

La cola reutiliza `outbox_messages`, aislada de las notificaciones BOOKING.
Para ADS_CONVERSION, `updatedAt` representa la próxima ejecución o el fin de lease.
Reclamación compare-and-set, lease de 120 s, timeout HTTP de 5 s. Reintentos para
fallos de red, 408, 429 y 5xx: 1 min hasta 1 h, máximo 10 intentos. Otros fallos
permanentes o eventos de siete días quedan FAILED. El vencimiento del consentimiento
puede detenerlos antes. Los logs no contienen credenciales ni payloads.
La limpieza horaria borra exclusivamente registros ADS_CONVERSION con más de
90 días, sin afectar notificaciones ni documentación de pagos. Si se deja Ads
desactivado permanentemente, purgar estos registros y los consentimientos
caducados de forma operativa, ya que el worker estará detenido.

`CHATGPT_ADS_VALIDATE_ONLY=true` valida sin registrar conversiones. Un evento
validado queda PUBLISHED localmente; cambiar a modo real no lo reenvía. No mezclar
colas de prueba con producción. Las pruebas usan datos sintéticos y transporte
simulado; no se han enviado peticiones a OpenAI.

## Antes de activar

- La política de privacidad de los cinco idiomas ya recoge la medición, la retirada,
  los destinatarios, la cookie, la caducidad de 24 h y los registros técnicos de 90 días.
- El despliegue aplica la migración y arranca el worker; publicar estos cambios junto
  con la integración antes de esperar eventos.
- Añadir las credenciales de la fuente JimBoats y comprobar el destino del anuncio
  con `oppref` en la reserva.
- Probar con `validate_only`, aceptación, rechazo y retirada.
- Activar explícitamente el envío real con `CHATGPT_ADS_VALIDATE_ONLY=false`.
  Configurar en Ads Manager el evento de compra y el evento personalizado de clic
  según los objetivos de la campaña. Recepción no garantiza atribución.

Referencias oficiales:
- https://learn.chatgpt.com/ads/conversions-api
- https://learn.chatgpt.com/ads/supported-events

## Activación desde GitHub Actions

En el repositorio `Rjuanez/jimboats-web`, abrir Settings → Secrets and variables →
Actions. Esta pipeline utiliza configuración a nivel de repositorio (no un
Environment de GitHub).

| Tipo | Nombre | Valor para envío real |
| --- | --- | --- |
| Secret | `CHATGPT_ADS_CAPI_KEY` | Clave CAPI de la fuente JimBoats |
| Variable | `CHATGPT_ADS_PIXEL_ID` | ID de la fuente JimBoats |
| Variable | `CHATGPT_ADS_ENABLED` | `true` |
| Variable | `CHATGPT_ADS_VALIDATE_ONLY` | `false` |

Los valores llegan solo al paso de despliegue, no a la construcción de la imagen.
Si faltan las variables, los valores predeterminados son desactivado y validación.
Si se solicita activar sin Pixel ID o clave, o con booleanos distintos de
`true`/`false`, el despliegue falla antes de modificar servicios.

`github-deploy-payload.py` genera un script con valores escapados mediante
`shlex.quote`. Se transmite directamente por la entrada estándar de SSH; no se
imprime ni se guarda en un archivo temporal y no incluye secretos en los argumentos
de SSH. Solo requiere Python en el runner Ubuntu, no en el servidor. También
transporta así las credenciales de lectura de GHCR. Los errores de validación
mencionan los nombres de las variables, nunca sus valores.

En cada ejecución de la pipeline, las cuatro opciones Ads de GitHub prevalecen
sobre posibles valores antiguos de `.env.production`. Esto incluye poner
`CHATGPT_ADS_ENABLED=false` o retirar una clave. El archivo del servidor no se
reescribe: conserva la configuración de base de datos, pagos, correo y demás
servicios. Compose recibe las opciones Ads exportadas en el entorno y las aplica
por igual a app y worker. Docker conserva esa configuración al reiniciar los
contenedores. Una recreación manual con otro entorno podría reemplazarla: utilizar
la pipeline para activar, desactivar o rotar estas credenciales.

Después de añadir los valores, publicar los cambios y ejecutar Deploy: se aplican
las migraciones y se recrean la web y el worker. Cambiar una variable o un secret
no modifica contenedores que ya están funcionando; ejecutar de nuevo el workflow
Deploy desde Actions → Deploy → Run workflow en `main` para aplicar el cambio.
Para pausar la medición, poner `CHATGPT_ADS_ENABLED=false` y ejecutar Deploy.

No necesitas editar las variables Ads por SSH. La configuración SSH existente de
la pipeline (`VPS_HOST`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY` y opcionalmente
`VPS_PORT`/`VPS_APP_DIR`) sigue utilizándose automáticamente.

## Consulta manual del worker

Si necesitas revisar logs, abre Google Cloud Console → Compute Engine → Instancias
de VM, selecciona el proyecto del VPS y pulsa SSH junto a la instancia. La sesión
del navegador ya está conectada. Entonces:

```sh
cd /srv/jimboats/web
docker compose --env-file .env.production -f infra/production/docker-compose.yml ps ads-conversion-worker
docker compose --env-file .env.production -f infra/production/docker-compose.yml logs --tail=50 ads-conversion-worker
```

Estos comandos consultan los contenedores, no los recrean. Los logs del worker no
incluyen credenciales ni eventos. La ejecución manual de `deploy.sh`, sin el
marcador de configuración de la pipeline, mantiene el comportamiento anterior y
lee las opciones Ads de `.env.production`; no es el procedimiento recomendado
cuando GitHub gestiona la configuración.

Fuentes de la actualización de privacidad (12-11-2026):
- https://www.aepd.es/guias/guia-cookies.pdf
- https://openai.com/policies/ad-tools-dpa/
- https://openai.com/policies/eu-privacy-policy/
