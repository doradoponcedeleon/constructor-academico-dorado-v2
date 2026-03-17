# Arquitectura · Plataforma Constructor Académico Dorado

## Visión general
La plataforma consolida el Constructor Académico Dorado como un sistema modular profesional. Cada módulo cumple una función específica y se integra a través de un shell central con router y estado global.

## Estructura
- **core/**: configuración general, esquema de datos base, almacenamiento y utilidades.
- **editor/**: creación de secciones, bloques y render del documento.
- **referencias/**: gestión de referencias, citas y bibliografía.
- **figuras/**: carga, validación y galería de figuras.
- **tablas/**: constructor y render de tablas académicas.
- **biblioteca/**: biblioteca local de documentos y buscador.
- **versiones/**: historial de snapshots y restauración.
- **exportadores/**: exportación a PDF, DOCX, HTML, TXT y JSON.
- **motor-ideas/**: análisis de ideas y generación de estructura.
- **revision/**: revisión académica de estructura y coherencia.
- **legal/**: control de recursos y atribuciones.
- **sync-github/**: integración con repositorios y sincronización.

## Principios
- Modularidad estricta
- Independencia frente a versiones anteriores
- UI profesional, clara y adaptable
- Persistencia local ampliable
