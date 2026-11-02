# TODO — lacunas do Mobile Frigus

## Nota fiscal

- [x] Ler conteúdo QR, consultar rascunho processado e confirmar ou ignorar itens: `POST /mobile/inventory/receipts/scan`, `GET /mobile/inventory/receipts/:receiptId` e `POST /mobile/inventory/receipts/:receiptId/confirm`.
- [ ] Avaliar upload de imagem/PDF da nota; o contrato atual recebe somente `qrPayload`.