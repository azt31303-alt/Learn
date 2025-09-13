
export enum Category {
  BANGLA_VOWELS = 'স্বরবর্ণ',
  BANGLA_CONSONANTS = 'ব্যঞ্জনবর্ণ',
  ENGLISH_ALPHABET = 'English Alphabet',
  BANGLA_NUMBERS = 'বাংলা সংখ্যা',
  ENGLISH_NUMBERS = 'English Numbers',
}

export interface LearningItem {
  character: string;
  word?: string;
  englishPronunciation?: string;
  image: string;
}
