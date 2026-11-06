-- Adjuntos de una solicitud (fotos de ejemplo / PDF), guardados en R2.
-- Se guarda un JSON: [{ key, name, size, type, url }]. La columna es texto
-- porque D1 no tiene tipo array y el contenido es de solo lectura para el equipo.
ALTER TABLE change_requests ADD COLUMN attachments TEXT NOT NULL DEFAULT '[]';
