/** Serialize snapshots shared by fold persistence and ordinary settings saves. */
export class SettingsWriter<T> {
  private tail: Promise<void> = Promise.resolve();

  private readonly write: (snapshot: T) => Promise<void>;
  constructor(write: (snapshot: T) => Promise<void>) {
    this.write = write;
  }

  save(value: T, allowed: () => boolean = () => true): Promise<void> {
    const snapshot = structuredClone(value);
    const job = this.tail.then(async () => {
      if (allowed()) {
        await this.write(snapshot);
      }
    });
    this.tail = job.catch(() => {
      /* Return the rejection to the caller, keep the queue usable. */
    });
    return job;
  }
}
