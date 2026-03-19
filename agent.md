# chatBOT - Documentación del Agente

Este proyecto es un bot de Discord diseñado para actuar como un sistema de recuperación de información basado en documentos locales (Markdown por ahora, Word planificado). Utiliza técnicas de procesamiento de lenguaje natural (NLP) simples para indexar y buscar contenido relevante.

## 🚀 Arquitectura del Proyecto

El proyecto sigue una estructura modular basada en eventos y repositorios:

- **Entry Point**: `index.js` inicializa el cliente de Discord, carga los eventos dinámicamente y se conecta.
- **Modelos (Entities)**: 
  - `Chunk`: Representa un fragmento de texto (párrafo) indexable.
  - `Jerarquia`: Define la estructura del documento (títulos, subtítulos) y agrupa los chunks.
- **Repositorios**:
  - `chunkRepository`: Gestiona la memoria de los chunks y utiliza `natural.TfIdf` para la búsqueda de similitud.
  - `jerarquiaRepository`: Mantiene la relación estructural entre las secciones del documento.
- **Lógica de Procesamiento**: `models/utils/mdProcesamiento.js` se encarga de parsear archivos Markdown, generar IDs únicos (SHA-256) y estructurar la jerarquía.

## 🛠 Tecnologías Principales

- **Runtime**: Node.js (ES Modules).
- **Discord API**: `discord.js` v14.
- **NLP**: `natural` (usando TF-IDF para búsqueda de similitud).
- **Persistencia**: Mongoose (Definida en schemas, pero el flujo actual es mayormente en memoria).
- **Testing**: Vitest.
- **Calidad**: ESLint y Husky (pre-commit/pre-push).

## 🧠 Flujo de Datos

1. **Ingesta**: Un archivo `.md` es procesado. Se divide en secciones por títulos (`#`, `##`, etc.) y párrafos.
2. **Indexación**: Cada párrafo se convierte en un `Chunk` y se añade al índice TF-IDF del `chunkRepository`.
3. **Evento de Discord**: Al crearse un hilo (`ThreadCreate`), el bot toma el contenido del primer mensaje.
4. **Recuperación**: Se busca el chunk más similar en el repositorio. Si el puntaje supera un umbral (ej: 0.2), el bot responde con el contenido y su ubicación jerárquica.

## 📋 Convenciones y Estándares

- **IDs**: Se generan hashes SHA-256 truncados a 16 caracteres basados en la ruta de títulos y el texto para asegurar consistencia.
- **Eventos**: Deben ubicarse en la carpeta `events/` y exportar un objeto con `name` y `execute`.
- **Testing**: Los tests se encuentran en `test/` y deben seguir el patrón de `*.test.js`.
- **Variables de Entorno**: Gestionadas via `.env` (ver `env.example`).

## 🗺 Hoja de Ruta (Todolist)

- [x] Modificar funcionamiento -> Vectorizar solo los titulos y comparar con eso
- [x] Modificar el funcionamiento. Para cada titulo conocer en que linea arrancar y con eso poder leer el .md en el momento.
- [x] Sanetizar los titulos con titulos con stopwords en español.
- [x] Mejorar jerarquia, de cada titulo conocer:
  - Titulos anteriores. Ejemplo: Titulo 1 > Titulo 2 > Titulo 3
  - Subtitulos del titulo. Ejemplo: Titulo: Componentes Arquitectonicos, Subtitulos: Broker, Cola de mensajes, CDN.
- [ ] Sugerir preguntas hechas en el foro del mismo estilo. Dos opciones:
  - Guardar las preguntas realizadas en una BD. (Implica mantenerlo, es decir que cuando se cree/elimine tenemos que saberlo).
  - Cada vez que se haga una consulta deberiamos pedir a Discord que nos de TODAS la preguntas del foro.
- [x] Mejorar la interacción con componentes de Discord.
  - [x] Permitir obtener información de cada subtitulo.

---
*Este archivo sirve como guía para agentes de IA y desarrolladores sobre la intención y estructura del proyecto.*
