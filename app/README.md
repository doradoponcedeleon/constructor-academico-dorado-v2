# Plataforma · Constructor Académico Dorado

## ¿Qué es la plataforma?
La carpeta **plataforma** es la línea base profesional y modular del Constructor Académico Dorado. Organiza el sistema por dominios funcionales y prepara el entorno para una evolución sostenida con módulos desacoplados, estado global y router interno.

## Arquitectura modular
- **core/**: configuración, esquema base, almacenamiento y utilidades.
- **editor/**: editor académico por secciones y bloques.
- **referencias/**: referencias, citas y bibliografía.
- **figuras/**: carga y gestión de figuras.
- **tablas/**: constructor de tablas editables.
- **biblioteca/**: documentos guardados localmente y buscador.
- **versiones/**: snapshots e historial.
- **exportadores/**: PDF, DOCX, HTML, TXT, JSON.
- **motor-ideas/**: generación de estructura y contenido base.
- **revision/**: validaciones académicas.
- **legal/**: control básico de recursos.
- **sync-github/**: sincronización con repositorios.

## Cómo abrir en navegador
1. Ejecuta un servidor local desde la raíz del proyecto:
   ```bash
   python -m http.server 8080
   ```
2. Abre en el navegador:
   - `http://localhost:8080/plataforma/`

## Nota
Esta plataforma es independiente de las versiones V1–V9 y está diseñada como base consolidada para un sistema académico modular.
