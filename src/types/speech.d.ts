interface SpeechRecognitionEvent extends Event {
  results: {
    0: {
      transcript?: string;
    };
  }[];
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
}
