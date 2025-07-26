import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/_base/entity/base.entity';
import { Business } from './Business';
import { Day } from './Day';
import { Availability } from '../enums/Availability.enums';
import { ValueTransformer } from 'typeorm';

// TIME formatını "HH:mm" yapmak için transformer
const timeTransformer: ValueTransformer = {
  to: (value: string) => value, // Veritabanına yazarken (isteğe bağlı formatlama)
  from: (value: string) => value.slice(0, 5), // Veritabanından okurken "HH:mm:ss" -> "HH:mm"
};
@Entity()
export class TimeSlot extends BaseEntity {
  @ManyToOne(() => Business, (business) => business.timeSlots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: number;

  @ManyToOne(() => Day, { eager: true })
  @JoinColumn({ name: 'day_id' })
  day: Day;

  @Column({ type: 'time', transformer: timeTransformer })
  start_time: string;

  @Column({ type: 'time', transformer: timeTransformer })
  end_time: string;

  // @Column({
  //   type: 'enum',
  //   enum: Availability,
  //   default: Availability.AVAILABLE,
  // })
  // is_available: Availability;
}
