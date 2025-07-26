import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TimeSlot } from './TimeSlot';


@Entity()
export class Day {
  @PrimaryColumn({ type: 'int', unique: true })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  day_name: string; 


  @OneToMany(() => TimeSlot, (slot) => slot.day)
  timeSlots: TimeSlot[];  
}