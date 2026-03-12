import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

function testWink() {
  const nlp = winkNLP( model );
  const its = nlp.its;
  const as = nlp.as;

  const doc1 = `CLI: Es una instrucción assemble para deshabilitar las interrupciones.`;
  const doc2 = `Interrupción Las interrupciones son señales que indican al CPU que hay un evento que requieren de atención. Pueden ser enmascarables (ignorables).`;
  
  const text = doc1 + " " + doc2;
  const doc = nlp.readDoc(text);

  console.log(doc.tokens().out());
}
testWink();
