import { NlpManager } from 'node-nlp';

async function testNodeNlp() {
  const manager = new NlpManager({ languages: ['es'], nlu: { log: false } });

  const doc1 = `Las interrupciones son señales que indican al CPU que hay un evento que requieren de atención. Pueden ser enmascarables (ignorables). Interrupciones sincrónicas: Excepciones, errores que se dan en ejecución. Interrupciones asíncronas: Dispositivo externo a la CPU`;
  const doc2 = `- Este método provoca mucho mas overhead, por lo que siempre se ve sin desalojo. - Prioridades: Se asigna una prioridad a cada proceso (puede ser un número que le demos o por ejemplo alguna métrica como la ráfaga de CPU (SJF)) y se ejecuta el proceso con la prioridad más alta (número pequeño 🡪 prioridad alta).`;

  manager.addDocument('es', doc1, 'chunk_0');
  manager.addDocument('es', doc2, 'chunk_1');

  await manager.train();

  const response = await manager.process('es', 'Que es una interrupción?');
  console.log("Intent:", response.intent);
  console.log("Score:", response.score);
}

testNodeNlp().catch(console.error);
