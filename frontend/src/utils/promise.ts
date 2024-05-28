export const resolvePromisesInBatches = async ({
  promises,
  batchSize = 2,
}: {
  promises: Promise<any>[];
  batchSize?: number;
}) => {
  const results = [];
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    results.push(...(await Promise.allSettled(batch)));
    await new Promise((r) => setTimeout(r, 2 * 1000));
  }
  return results;
};
