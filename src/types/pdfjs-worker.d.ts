declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  export const WorkerMessageHandler: {
    setup: (...args: unknown[]) => void;
  };
}

declare var pdfjsWorker:
  | {
      WorkerMessageHandler: {
        setup: (...args: unknown[]) => void;
      };
    }
  | undefined;
