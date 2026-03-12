import natural from "natural";

try {
  // Let's print out what natural.PorterStemmerEs actually has
  console.log("StemmerEs keys:", Object.keys(natural.PorterStemmerEs));
  console.log("Stem example:", natural.PorterStemmerEs.stem("interrupción"), " -> ", natural.PorterStemmerEs.stem("interrupciones"));

  // Check if TfIdf constructor takes a stemmer
  // Source code of natural/lib/natural/tfidf/tfidf.js:
  // function TfIdf(deserialized, options) -> options can be an object with options.stemmer
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf(); // Let's see if we can overwrite tokenizer
  
  // Custom tokenizer for Spanish
  const tokenizer = new natural.WordTokenizer();
  
  // Custom Spanish stop words
  const spanishStopWords = [
    'que', 'es', 'una', 'un', 'el', 'la', 'los', 'las', 'de', 'para', 
    'con', 'por', 'a', 'en', 'y', 'o', 'se', 'lo', 'como', 'son', 'al', 'hay'
  ];
  
  // Maybe we can just manually process the texts in chunkRepository!
  // chunkRepository can stem text before passing to tfidfIndex.addDocument:
  const query = "Que es una interrupción?";
  const doc = "Las interrupciones son señales que indican al CPU que hay un evento que requieren de atención.";

  const processText = (text) => {
    // 1. Tokenize
    const tokens = tokenizer.tokenize(text.toLowerCase());
    // 2. Remove stopwords
    const filtered = tokens.filter(t => !spanishStopWords.includes(t));
    // 3. Stem (removing accents handling inside stemmer if it doesn't do it)
    const stemmed = filtered.map(t => natural.PorterStemmerEs.stem(t));
    return stemmed.join(" ");
  };

  console.log("Processed Query:", processText(query));
  console.log("Processed Doc:", processText(doc));

  const customTfidf = new TfIdf();
  customTfidf.addDocument(processText(doc));
  customTfidf.addDocument(processText("- Este método provoca mucho mas overhead, por lo que siempre se ve sin desalojo."));

  customTfidf.tfidfs(processText(query), (i, score) => {
      console.log(`Doc ${i} score:`, score);
  });

} catch (e) {
  console.error("Error:", e);
}
