import natural from "natural";

try {
  const tokenizer = new natural.AggressiveTokenizerEs();
  
  const query = "Que es una interrupción?";
  console.log("TokenizerEs output:", tokenizer.tokenize(query));
  
  // Custom TfIdf initialization with Spanish stop words
  const spanishStopWords = [
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'es', 'son'
  ];

  natural.stopwords = typeof natural.stopwords === 'object' && Array.isArray(natural.stopwords) ? natural.stopwords.concat(spanishStopWords) : spanishStopWords;
  
  const processTextEs = (text) => {
    // 1. Tokenize keeping accents
    const tokens = tokenizer.tokenize(text.toLowerCase());
    // 2. Remove stopwords
    const filtered = tokens.filter(t => !spanishStopWords.includes(t));
    // 3. Stem
    const stemmed = filtered.map(t => natural.PorterStemmerEs.stem(t));
    return stemmed.join(" ");
  };

  const doc = "Las interrupciones son señales que indican al CPU que hay un evento que requieren de atención.";
  const doc2 = "- Este método provoca mucho mas overhead, por lo que siempre se ve sin desalojo.";

  console.log("Processed Doc 1:", processTextEs(doc));
  console.log("Processed Doc 2:", processTextEs(doc2));

  const customTfidf = new natural.TfIdf();
  customTfidf.addDocument(processTextEs(doc));
  customTfidf.addDocument(processTextEs(doc2));

  customTfidf.tfidfs(processTextEs(query), (i, score) => {
      console.log(`Doc ${i} score:`, score);
  });
} catch (e) {
  console.error(e);
}
