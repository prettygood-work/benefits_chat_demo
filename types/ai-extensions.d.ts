import { UIMessageStreamWriter } from 'ai';

declare module 'ai' {
  interface UIMessageStreamWriter {
    writeData?: (data: any) => void;
    writeArtifact?: (artifact: any) => void;
  }
}
