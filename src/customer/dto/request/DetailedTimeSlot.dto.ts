export class DetailedTimeSlotDto {
  id: number;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  isAvailableForBooking: boolean; // Dolu mu boş mu?
}
