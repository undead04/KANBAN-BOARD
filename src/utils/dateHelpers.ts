/**
 * dateHelpers.ts - Các hàm tiện ích xử lý và kiểm tra ngày tháng
 */

/**
 * Regex kiểm tra các biến thể hợp lệ của cột Đã hoàn thành (Done):
 * Khớp chính xác 'col-done', 'col_done', 'done', 'col-completed', 'col_completed', 'completed' (không phân biệt hoa/thường).
 * Tuyệt đối không khớp substring của các cột khác như 'abandoned', 'undone', 'not-done', 'condone'.
 */
const DONE_COLUMN_REGEX = /^(col[-_])?(done|completed)$/i;

/**
 * Regex kiểm tra định dạng ISO 8601 datetime (ví dụ: '2026-11-01T15:30:00.000Z' hoặc '2026-11-01 15:30:00')
 */
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

/**
 * Regex kiểm tra định dạng ngày YYYY-MM-DD
 */
const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Trả về chuỗi ngày YYYY-MM-DD theo giờ địa phương (local time).
 * @param referenceDate Ngày tham chiếu (mặc định là thời điểm hiện tại).
 */
export function getTodayDateString(referenceDate?: Date): string {
  const date = referenceDate && !isNaN(referenceDate.getTime()) ? referenceDate : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Kiểm tra xem thẻ công việc có bị quá hạn (overdue) hay không.
 *
 * Quy tắc:
 * 1. Nếu không có dueDate hoặc chuỗi rỗng/chỉ chứa khoảng trắng -> false.
 * 2. Cột Done: Chỉ nhận diện 'col-done', 'col_done', 'done', 'completed' hoặc regex ^(col[-_])?(done|completed)$.
 *    Tuyệt đối không nhầm lẫn với 'abandoned', 'undone', 'not-done', 'condone'.
 * 3. Hỗ trợ chuỗi ngày YYYY-MM-DD hoặc ISO datetime hợp lệ (lấy 10 ký tự đầu YYYY-MM-DD).
 * 4. Kiểm tra ngữ nghĩa lịch (semantic date validation):
 *    Loại bỏ các ngày không có thật như 2026-02-30, 2026-04-31, 2025-02-29 (năm không nhuận).
 * 5. So sánh normalizedDueDate < todayStr (theo giờ địa phương).
 *
 * @param dueDate Hạn hoàn thành của thẻ công việc.
 * @param columnId ID cột chứa thẻ.
 * @param referenceDate Ngày mốc để so sánh (mặc định là hôm nay).
 */
export function isTaskOverdue(
  dueDate?: string,
  columnId?: string,
  referenceDate?: Date
): boolean {
  if (!dueDate || typeof dueDate !== 'string' || !dueDate.trim()) {
    return false;
  }

  // 1. Kiểm tra cột Done (khớp chính xác, tránh nhầm lẫn 'abandoned', 'undone')
  if (columnId && typeof columnId === 'string' && DONE_COLUMN_REGEX.test(columnId.trim())) {
    return false;
  }

  const trimmed = dueDate.trim();

  // 2. Trích xuất phần ngày (YYYY-MM-DD)
  let datePart: string;
  if (trimmed.length === 10) {
    datePart = trimmed;
  } else if (trimmed.length > 10) {
    // Nếu có phần giờ (ISO datetime), xác thực cấu trúc trước khi lấy 10 ký tự đầu
    if (!ISO_DATETIME_REGEX.test(trimmed)) {
      return false;
    }
    datePart = trimmed.slice(0, 10);
  } else {
    return false;
  }

  // 3. Kiểm tra định dạng ngày YYYY-MM-DD
  const match = datePart.match(DATE_REGEX);
  if (!match) {
    return false;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Tháng phải từ 1-12, ngày từ 1-31
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // 4. Kiểm tra tính hợp lệ trên lịch (Calendar Validity)
  // Ví dụ: 2026-02-30 hay 2025-02-29 trong JS Date sẽ bị tràn sang tháng 3
  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return false;
  }

  // 5. So sánh với ngày hôm nay theo local time
  const todayStr = getTodayDateString(referenceDate);
  return datePart < todayStr;
}
