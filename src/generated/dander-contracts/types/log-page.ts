/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
