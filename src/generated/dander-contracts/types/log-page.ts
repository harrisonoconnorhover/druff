/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type NextCursor = string | null;
export type Code = string;
export type CorrelationId = string;
/**
 * This interface was referenced by `LogPageResponse`'s JSON-Schema
 * via the `definition` "LogLevel".
 */
export type LogLevel = "debug" | "info" | "warning" | "error";
export type Message = string;
export type Timestamp = string;
export type Records = LogRecord[];

export interface LogPageResponse {
  next_cursor?: NextCursor;
  records: Records;
}
/**
 * This interface was referenced by `LogPageResponse`'s JSON-Schema
 * via the `definition` "LogRecord".
 */
export interface LogRecord {
  code: Code;
  correlation_id: CorrelationId;
  level: LogLevel;
  message: Message;
  timestamp: Timestamp;
}
