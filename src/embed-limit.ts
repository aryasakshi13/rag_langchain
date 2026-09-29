import { Embeddings } from "@langchain/core/embeddings";

export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results: Array<R | undefined> = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  });

  await Promise.all(workers);

  return results as R[];
}

export class ConcurrencyLimitedEmbeddings extends Embeddings {
  constructor(
    private readonly inner: Embeddings,
    private readonly concurrency = 2,
  ) {
    super({});
  }

  override async embedQuery(input: string): Promise<number[]> {
    return this.inner.embedQuery(input);
  }

  override async embedDocuments(input: string[]): Promise<number[][]> {
    const batchSize = Math.max(1, Math.min(this.concurrency, input.length));
    const results: number[][] = [];

    for (let i = 0; i < input.length; i += batchSize) {
      const batch = input.slice(i, i + batchSize);
      const batchResults = await this.inner.embedDocuments(batch);
      results.push(...batchResults);
    }

    return results;
  }
}
