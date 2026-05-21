/**
 * Every use case implements this contract: a single `handle(input)` entry
 * point. Keeps use cases uniform and rules out giant multi-method services.
 */
export interface UseCaseHandler<Input, Output = void> {
  handle(input: Input): Promise<Output>;
}
