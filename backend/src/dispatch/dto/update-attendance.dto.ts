export class UpdateAttendanceDto {
  status: 'unoccupied' | 'absent';
  adminName?: string;
}
