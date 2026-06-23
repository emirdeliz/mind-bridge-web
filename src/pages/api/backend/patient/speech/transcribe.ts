import { createSpeechTranscribeHandler } from '@lib/http/speechTranscribeProxy';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '6mb',
  },
};

export default createSpeechTranscribeHandler('/patient/speech/transcribe');
