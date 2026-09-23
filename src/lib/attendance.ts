export const COLOR_GROUPS = [
  { value: "red", label: "แดง", dot: "bg-red-400", badge: "bg-red-100 text-red-700" },
  { value: "orange", label: "ส้ม", dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700" },
  { value: "yellow", label: "เหลือง", dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700" },
  { value: "green", label: "เขียว", dot: "bg-green-400", badge: "bg-green-100 text-green-700" },
  { value: "blue", label: "ฟ้า", dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700" },
  { value: "purple", label: "ม่วง", dot: "bg-purple-400", badge: "bg-purple-100 text-purple-700" },
] as const;

export type ColorGroupValue = (typeof COLOR_GROUPS)[number]["value"];

export function colorGroupMeta(value: string) {
  return COLOR_GROUPS.find((g) => g.value === value) ?? COLOR_GROUPS[4];
}

const BANGKOK_TZ = "Asia/Bangkok";

export function formatThaiDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    timeZone: BANGKOK_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatThaiTime(date: Date) {
  return date.toLocaleTimeString("th-TH", {
    timeZone: BANGKOK_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatThaiDateTime(date: Date) {
  return `${formatThaiDate(date)} ${formatThaiTime(date)}`;
}

/** Calendar date (Bangkok time) at 00:00, used as a stable key for grouping by day. */
export function startOfBangkokDay(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

export function dateKey(date: Date): string {
  return startOfBangkokDay(date).toISOString().slice(0, 10);
}

/** True UTC instants bounding the Bangkok calendar day containing `date`. */
export function bangkokDayRange(date: Date): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  const start = new Date(`${y}-${m}-${d}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 86400000);
  return { start, end };
}

export function bangkokWeekday(date: Date): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK_TZ,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd];
}

export function bangkokHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BANGKOK_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const minute = Number(parts.find((p) => p.type === "minute")!.value);
  return { hour, minute };
}

// --- Distance / geofencing ---------------------------------------------

export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findMatchingLocation<
  L extends { latitude: number; longitude: number; radiusMeters: number },
>(lat: number, lon: number, locations: L[]): L | null {
  for (const loc of locations) {
    if (distanceMeters(lat, lon, loc.latitude, loc.longitude) <= loc.radiusMeters) {
      return loc;
    }
  }
  return null;
}

// --- Work schedule --------------------------------------------------------

export type SettingsShape = {
  workStart: string;
  workEnd: string;
  lateGraceMinutes: number;
  workDays: string;
};

export function workDayNumbers(settings: SettingsShape): number[] {
  return settings.workDays
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

export function isWorkDay(date: Date, settings: SettingsShape): boolean {
  return workDayNumbers(settings).includes(bangkokWeekday(date));
}

/** Returns true if a clock-in at `date` counts as late under `settings`. */
export function computeLate(date: Date, settings: SettingsShape): boolean {
  const [startHour, startMinute] = settings.workStart.split(":").map(Number);
  const { hour, minute } = bangkokHourMinute(date);
  const graceMinutesTotal = startHour * 60 + startMinute + settings.lateGraceMinutes;
  const actualMinutesTotal = hour * 60 + minute;
  return actualMinutesTotal > graceMinutesTotal;
}

export const WEEKDAY_LABELS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

// --- Summary aggregation ---------------------------------------------------

export type AttendanceStatus = "present" | "late" | "absent" | "leave" | "pending";

export type EmployeeDaySummary = {
  employeeId: string;
  employeeName: string;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  totalHours: number;
};

interface RawEntry {
  employeeId: string;
  type: string;
  timestamp: Date;
  late: boolean;
}

interface RawAbsence {
  employeeId: string | null;
  date: Date;
  endDate: Date | null;
  status: string;
}

export function buildAttendanceSummary(
  employees: { id: string; name: string }[],
  entries: RawEntry[],
  absences: RawAbsence[],
  settings: SettingsShape,
  rangeStart: Date,
  rangeEnd: Date
): EmployeeDaySummary[] {
  const entriesByEmployee = new Map<string, RawEntry[]>();
  for (const e of entries) {
    if (!entriesByEmployee.has(e.employeeId)) entriesByEmployee.set(e.employeeId, []);
    entriesByEmployee.get(e.employeeId)!.push(e);
  }

  const approvedLeaveByEmployee = new Map<string, Set<string>>();
  for (const a of absences) {
    if (!a.employeeId || a.status !== "approved") continue;
    if (!approvedLeaveByEmployee.has(a.employeeId)) {
      approvedLeaveByEmployee.set(a.employeeId, new Set());
    }
    const set = approvedLeaveByEmployee.get(a.employeeId)!;
    const start = startOfBangkokDay(a.date);
    const end = a.endDate ? startOfBangkokDay(a.endDate) : start;
    for (let d = start; d.getTime() <= end.getTime(); d = new Date(d.getTime() + 86400000)) {
      set.add(dateKey(d));
    }
  }

  const today = startOfBangkokDay(new Date());

  const dayKeys: string[] = [];
  for (
    let d = startOfBangkokDay(rangeStart);
    d.getTime() <= startOfBangkokDay(rangeEnd).getTime();
    d = new Date(d.getTime() + 86400000)
  ) {
    if (d.getTime() > today.getTime()) break;
    if (isWorkDay(d, settings)) dayKeys.push(dateKey(d));
  }

  return employees.map((emp) => {
    const empEntries = entriesByEmployee.get(emp.id) ?? [];
    const inByDay = new Map<string, RawEntry>();
    for (const e of empEntries) {
      if (e.type !== "IN") continue;
      const key = dateKey(e.timestamp);
      const existing = inByDay.get(key);
      if (!existing || e.timestamp < existing.timestamp) inByDay.set(key, e);
    }

    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let leaveDays = 0;

    for (const key of dayKeys) {
      const inEntry = inByDay.get(key);
      if (inEntry) {
        if (inEntry.late) lateDays++;
        else presentDays++;
      } else if (approvedLeaveByEmployee.get(emp.id)?.has(key)) {
        leaveDays++;
      } else {
        absentDays++;
      }
    }

    // Total hours worked from IN/OUT pairs within the range.
    const sorted = [...empEntries].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    let totalMs = 0;
    let openIn: Date | null = null;
    for (const e of sorted) {
      if (e.type === "IN") {
        openIn = e.timestamp;
      } else if (e.type === "OUT" && openIn) {
        totalMs += e.timestamp.getTime() - openIn.getTime();
        openIn = null;
      }
    }

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      totalHours: Math.round((totalMs / 3600000) * 10) / 10,
    };
  });
}

/** Formats a decimal hour count (e.g. 152.3) as "152 ชม. 18 นาที". */
export function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
}

// --- Per-employee daily timeline (for the admin attendance-log view) ------

export type TimelineSegment = {
  startMin: number;
  endMin: number;
  late: boolean;
  locationName: string | null;
  ongoing: boolean;
};

export type DayTimeline = {
  dateKey: string;
  label: string;
  segments: TimelineSegment[];
};

interface TimelineEntry {
  type: string;
  timestamp: Date;
  late: boolean;
  locationName: string | null;
}

export function buildDayTimelines(entries: TimelineEntry[]): DayTimeline[] {
  const byDay = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const key = dateKey(e.timestamp);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(e);
  }

  const days: DayTimeline[] = [];
  for (const [key, dayEntries] of byDay) {
    const sorted = [...dayEntries].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const segments: TimelineSegment[] = [];
    let openIn: TimelineEntry | null = null;

    for (const e of sorted) {
      if (e.type === "IN") {
        openIn = e;
      } else if (e.type === "OUT" && openIn) {
        const start = bangkokHourMinute(openIn.timestamp);
        const end = bangkokHourMinute(e.timestamp);
        segments.push({
          startMin: start.hour * 60 + start.minute,
          endMin: end.hour * 60 + end.minute,
          late: openIn.late,
          locationName: openIn.locationName,
          ongoing: false,
        });
        openIn = null;
      }
    }

    if (openIn) {
      const start = bangkokHourMinute(openIn.timestamp);
      segments.push({
        startMin: start.hour * 60 + start.minute,
        endMin: start.hour * 60 + start.minute + 20,
        late: openIn.late,
        locationName: openIn.locationName,
        ongoing: true,
      });
    }

    days.push({ dateKey: key, label: formatThaiDate(sorted[0].timestamp), segments });
  }

  return days.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
}
