const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function toArabicDigits(value: string): string {
  return value.replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

/**
 * تنسيق تاريخ النشر بشكل ثابت لا يعتمد على ICU في الخادم أو المتصفح.
 *
 * `toLocaleDateString` قد تُنتج نصًّا مختلفًا بين Node والمتصفح (خصوصًا مع
 * اللغة العربية)، فيفشل ترطيب React. نستخدم UTC حتى لا يغيّر فرق التوقيت اليوم.
 */
export function formatPublishDate(value: string, isArabic: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (isArabic) {
    return `${toArabicDigits(String(day))} ${AR_MONTHS[month]} ${toArabicDigits(String(year))}`;
  }

  return `${EN_MONTHS[month]} ${day}, ${year}`;
}
