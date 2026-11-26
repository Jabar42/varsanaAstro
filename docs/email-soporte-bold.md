# Archivo histórico: consulta a soporte Bold

Este documento era un borrador de consulta de una integración anterior en Vercel/Supabase. **No representa el flujo actual ni contiene instrucciones vigentes.** La consulta se refería a la ausencia de notificaciones webhook; no demuestra que la configuración actual de la cuenta sea correcta.

El cuerpo original se retiró porque incluía credenciales en texto plano. **Ese par debe revocarse o rotarse en Bold**: retirar valores del archivo no los borra del historial de Git. No copiar el borrador histórico a correos, tickets, chats ni otras notas.

Contrato vigente: [Bold en Varsana](./bold-payments.md).

- Runtime actual: Cloudflare Workers + D1.
- URL canónica: `https://varsana-co.iaforchange.workers.dev`.
- Webhook: `https://varsana-co.iaforchange.workers.dev/api/webhook/bold`.
- Soporte de pagos en línea indicado por la documentación oficial: `soporte.online@bold.co`.
- Toda consulta nueva a soporte debe describir el código vigente y adjuntar sólo referencias/logs saneados, nunca llaves.
