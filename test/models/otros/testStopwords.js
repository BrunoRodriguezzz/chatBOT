import natural from "natural";

const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

const doc1 = `Las interrupciones son señales que indican al CPU que hay un evento que requieren de atención. Pueden ser enmascarables (ignorables). Interrupciones sincrónicas: Excepciones, errores que se dan en ejecución. Interrupciones asíncronas: Dispositivo externo a la CPU`;
const doc2 = `- Este método provoca mucho mas overhead, por lo que siempre se ve sin desalojo. - Prioridades: Se asigna una prioridad a cada proceso (puede ser un número que le demos o por ejemplo alguna métrica como la ráfaga de CPU (SJF)) y se ejecuta el proceso con la prioridad más alta (número pequeño 🡪 prioridad alta).`;

tfidf.addDocument(doc1);
tfidf.addDocument(doc2);

console.log("=== DEFAULT (English Stopwords) ===");
tfidf.tfidfs("Que es una interrupción?", (i, score) => {
    console.log(`Doc ${i} score:`, score);
});


// With Spanish Stop words and Stemmer (maybe tokenizer?)
natural.PorterStemmerEs.attach();

console.log("Tokenized query:", "Que es una interrupción?".tokenizeAndStem());

// Let's create a custom TfIdf tokenizer using Spanish words
// Actually natural.TfIdf can take an analyzer? No, the best way in natural for TF-IDF in another language is either pre-tokenizing documents or passing the Spanish stemmer.
// Let's try passing PorterStemmerEs to TfIdf builder or just manually filtering stop words?
// There's no direct TfIdf(stopwords) constructor. You can use tokenizer or stemmer? No, TfIdf uses natural's WordTokenizer and stopwords.
// Actually, `natural.stopwords` is an array. We can add Spanish words to it.
natural.stopwords.push('que', 'es', 'una', 'un', 'el', 'la', 'los', 'las', 'de', 'para', 'con', 'por', 'a', 'en', 'y', 'o', 'se', 'lo', 'como');

const tfidf2 = new TfIdf();
tfidf2.addDocument(doc1);
tfidf2.addDocument(doc2);
console.log("=== With Spanish Stopwords added ===");
tfidf2.tfidfs("Que es una interrupción?", (i, score) => {
    console.log(`Doc ${i} score:`, score);
});
