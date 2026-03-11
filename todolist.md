<!-->Por ahora solo con MarkDown<-->
1. Funcion que lea un documento de word. Usar `mammoth`
2. Procesar ese documento de word:
   1. Entender estilos como Título, Subtitulo
   2. General la jerarquia del apunte
   3. Vectorizar los chunks (dividir por parrafos)
   4. Guardar esos chunks vectorizados
   5. Generar una estructura en memoria similar a esta:

```javascript
{
  chunks: [
    { id: "c-1", id_padre: "a1b2c3d4", texto: "El comando /ayuda muestra todos los comandos disponibles del bot." },
    { id: "c-2", id_padre: "a1b2c3d4", texto: "Podés usarlo en cualquier canal del servidor." },
    { id: "c-3", id_padre: "e5f6g7h8", texto: "El comando /stats muestra estadísticas del servidor actual." }
  ],
  jerarquia: {
    "gen-inicio": {
      titulo: "General",
      subtitulo: "Inicio",
      ids_chunks_hijos: []           
    },
    "a1b2c3d4": {
      titulo: "Comandos del Bot",
      subtitulo: "Comandos básicos",
      ids_chunks_hijos: ["c-1", "c-2"]
    },
    "e5f6g7h8": {
      titulo: "Comandos del Bot",
      subtitulo: "Comandos avanzados",
      ids_chunks_hijos: ["c-3"]
    }
  },
  tfidf_index: TfIdf {  }
}
```

3. Al recibir un mensaje de un hilo, el bot debe responder con el chunk que mas se parezca (definir un puntaje minimo).
4. El bot ademas debe dar la opcion de pedir informacion extra de subtitulos o titulos asociados.
   1. Investigar uso de componentes, propuesta:
      1. Leer sección completa (devuelve todos los chunks de esa seccion)
      2. Ver subtitulos de la sección -> despues puede pedir.