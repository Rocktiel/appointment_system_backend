export class DetailedTimeSlotDto {
  id: number;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  isAvailableForBooking: boolean; // Dolu mu boş mu?
  customer_name?: string; // Randevu varsa müşteri adı
  customer_phone?: string; // Randevu varsa müşteri telefon numarası
}
