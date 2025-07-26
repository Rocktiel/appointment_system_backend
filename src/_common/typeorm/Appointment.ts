// import { BaseEntity } from 'src/_base/entity/base.entity';
// import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
// import { AppointmentStatus } from '../enums/AppointmentStatus.enum';
// import { Business } from './Business';
// import { Day } from './Day';
// import { Service } from './Service';

// @Entity()
// export class Appointment extends BaseEntity {
//   @ManyToOne(() => Business, (business) => business.appointments, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'business_id' })
//   business: Business;

//   @Column()
//   business_id: number;

//   @ManyToOne(() => Day, { eager: true })
//   @JoinColumn({ name: 'day_id' })
//   day: Day;

//   @Column()
//   day_id: number;

//   @ManyToOne(() => Service, (service) => service) // Service varlığına doğrudan bağlanıyoruz
//   @JoinColumn({ name: 'service_id' }) // Bu sütun, Service tablosuna referans verecek
//   service: Service;

//   @Column()
//   service_id: number; // Foreign key sütunu 👈 YENİ!

//   @Column({ type: 'date' })
//   date: string;

//   @Column({ type: 'time' })
//   start_time: string;

//   @Column({ type: 'time' })
//   end_time: string;

//   @Column({ type: 'varchar', length: 100 })
//   customer_name: string;

//   @Column({ type: 'varchar', length: 20 })
//   customer_phone: string;

//   @Column({ type: 'text', nullable: true })
//   note: string;

//   @Column({
//     type: 'enum',
//     enum: AppointmentStatus,
//     default: AppointmentStatus.PENDING,
//   })
//   status: AppointmentStatus;
// }
import { BaseEntity } from 'src/_base/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AppointmentStatus } from '../enums/AppointmentStatus.enum';
import { Business } from './Business';
import { Day } from './Day';
import { Service } from './Service';
import { TimeSlot } from './TimeSlot'; // TimeSlot'u import et

@Entity()
export class Appointment extends BaseEntity {
  @ManyToOne(() => Business, (business) => business.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: number;

  // Eğer bu randevunun hangi genel zaman dilimi şablonuna karşılık geldiğini
  // bilmek istiyorsanız bu ilişkiyi ekleyebilirsiniz.
  // Bu isteğe bağlıdır, sadece date, start_time, end_time yeterli olabilir.
  @ManyToOne(() => TimeSlot, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'time_slot_template_id' }) // Yeni JoinColumn adı
  timeSlotTemplate: TimeSlot;

  @Column({ nullable: true }) // Bu sütunu nullable yapın çünkü her randevu bir şablondan gelmeyebilir
  time_slot_template_id: number; // Foreign key sütunu

  @ManyToOne(() => Day, { eager: true })
  @JoinColumn({ name: 'day_id' })
  day: Day;

  @Column()
  day_id: number;

  @ManyToOne(() => Service, (service) => service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column()
  service_id: number;

  @Column({ type: 'date' })
  date: string; // Örn: "2025-07-21" - Bu zaten var ve çok önemli!

  @Column({ type: 'time' })
  start_time: string; // Örn: "14:00:00"

  @Column({ type: 'time' })
  end_time: string; // Örn: "14:30:00"

  @Column({ type: 'varchar', length: 100 })
  customer_name: string;

  @Column({ type: 'varchar', length: 20 })
  customer_phone: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'appointment_status_enum',
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;
}
