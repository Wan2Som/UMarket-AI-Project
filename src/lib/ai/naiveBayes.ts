/**
 * Multinomial Naive Bayes text classifier with Laplace smoothing.
 *
 * Small, dependency-free and fast enough to retrain in the browser on every
 * page load (~120 documents trains in well under a millisecond). It is also
 * explainable: for any prediction we can list the words that pushed the
 * decision, which the AI assistant panel shows to the seller.
 */
export class MultinomialNaiveBayes<L extends string> {
  private readonly labels: L[];
  private docCount = new Map<L, number>();
  private tokenCount = new Map<L, Map<string, number>>();
  private totalTokens = new Map<L, number>();
  private vocab = new Set<string>();
  private totalDocs = 0;

  constructor(labels: L[], private readonly alpha = 1) {
    this.labels = labels;
    for (const l of labels) {
      this.docCount.set(l, 0);
      this.tokenCount.set(l, new Map());
      this.totalTokens.set(l, 0);
    }
  }

  train(label: L, tokens: string[]): void {
    this.totalDocs++;
    this.docCount.set(label, (this.docCount.get(label) ?? 0) + 1);
    const counts = this.tokenCount.get(label)!;
    for (const t of tokens) {
      this.vocab.add(t);
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    this.totalTokens.set(label, (this.totalTokens.get(label) ?? 0) + tokens.length);
  }

  /** log P(token | label) with Laplace smoothing. */
  private logLikelihood(label: L, token: string): number {
    const count = this.tokenCount.get(label)!.get(token) ?? 0;
    const denom = this.totalTokens.get(label)! + this.alpha * this.vocab.size;
    return Math.log((count + this.alpha) / denom);
  }

  /**
   * Posterior probabilities for each label. Tokens never seen in training are
   * ignored (they carry no information and would only flatten the result).
   */
  predict(tokens: string[]): { probabilities: Record<L, number>; known: string[] } {
    const known = tokens.filter((t) => this.vocab.has(t));
    const logScores = this.labels.map((l) => {
      let s = Math.log((this.docCount.get(l)! + this.alpha) / (this.totalDocs + this.alpha * this.labels.length));
      for (const t of known) s += this.logLikelihood(l, t);
      return s;
    });
    // Naive Bayes treats every word as independent evidence, so raw posteriors
    // saturate at ~100% after a handful of words. Temperature-scale by the
    // number of known tokens to get confidences people can read as "how sure".
    // This never changes which label wins.
    const temperature = Math.max(1, known.length / 4);
    const scaled = logScores.map((s) => s / temperature);
    // Softmax in log space for numerical stability.
    const max = Math.max(...scaled);
    const exps = scaled.map((s) => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    const probabilities = Object.fromEntries(this.labels.map((l, i) => [l, exps[i] / sum])) as Record<L, number>;
    return { probabilities, known };
  }

  /**
   * Words that most favour `label` over the other labels, by log-likelihood ratio.
   * Used to explain a prediction ("because: textbook, calculus").
   */
  evidence(label: L, tokens: string[], limit = 3): string[] {
    const others = this.labels.filter((l) => l !== label);
    const scored = Array.from(new Set(tokens.filter((t) => this.vocab.has(t))))
      .map((t) => {
        const mine = this.logLikelihood(label, t);
        const theirs = Math.max(...others.map((o) => this.logLikelihood(o, t)));
        return { t, score: mine - theirs };
      })
      .filter((x) => x.score > 0.4)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((x) => x.t.replace(/_/g, " "));
  }
}
