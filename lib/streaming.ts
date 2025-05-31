import { ReadableStream } from 'stream/web';

interface StreamingUI {
  stream: ReadableStream;
  writer: WritableStreamDefaultWriter;
}

export function createStreamableUI(): StreamingUI {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const writer = {
    write(chunk: string) {
      if (controller) {
        controller.enqueue(encoder.encode(chunk));
      }
    },
    close() {
      if (controller) {
        controller.close();
      }
    },
    abort(reason?: any) {
      if (controller) {
        controller.error(reason);
      }
    },
  } as WritableStreamDefaultWriter;

  return { stream, writer };
} 