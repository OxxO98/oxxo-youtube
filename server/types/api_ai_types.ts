export interface ChatContextMessage {
  role: "system" | "user" | "assistant" | string;
  content: string;
}

export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  koText?: string;
}

export interface TimestampRange {
  from: string;
  to: string;
}

export interface OffsetRange {
  from: number;
  to: number;
}

export interface StoredTranscriptSegment {
  timestamps: TimestampRange;
  offsets: OffsetRange;
  text: string;
  koText?: string;
}

export interface TranscriptFile {
  transcription: StoredTranscriptSegment[];
}

export interface WhisperOption {
  reset?: string | boolean;
  lang: string;
  model: string;
}
