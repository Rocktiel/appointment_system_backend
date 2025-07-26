import { BaseEntity } from 'src/_base/entity/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { BusinessTypes } from '../enums/BusinessTypes.enums';
import { TimeSlot } from './TimeSlot';
import { Appointment } from './Appointment';
import { Service } from './Service';

// @Entity()
// export class Business extends BaseEntity {
//   @Column({ type: 'varchar', length: 255 })
//   businessName: string;

//   @Column({ type: 'varchar', length: 255 })
//   businessAddress: string;

//   @Column({ type: 'varchar', length: 255, comment: 'Format = 905055055050' })
//   businessPhone: string;

//   @Column({ type: 'varchar', length: 255 })
//   businessEmail: string;

//   @Column({ type: 'varchar', length: 255, nullable: true })
//   businessWebsite: string;

//   @Column({ type: 'text', nullable: true })
//   businessDescription: string;

//   @Column({ type: 'text', nullable: true })
//   businessLogo: string;

//   @Column({ type: 'enum', enum: BusinessTypes, default: BusinessTypes.OTHER })
//   businessType: BusinessTypes;

//   @Column({ type: 'varchar', length: 255, unique: true })
//   slug: string;

//   @Column({ type: 'varchar', length: 255, unique: true })
//   businessLocationUrl: string;

//   @Column({ type: 'boolean', default: false })
//   isPhoneVerified: boolean;

//   @Column({ type: 'boolean', default: false })
//   isPhoneVisible: boolean;

//   @Column({ type: 'boolean', default: false })
//   isLocationVisible: boolean;

//   @ManyToOne(() => User, (user) => user.businesses, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'user_id' })
//   user: User;

//   @OneToMany(() => TimeSlot, (timeSlot) => timeSlot.business)
//   timeSlots: TimeSlot[];

//   @OneToMany(() => Appointment, (appointment) => appointment.business)
//   appointments: Appointment[];

//   @OneToMany(() => Service, (service) => service.business)
//   services: Service[]; // İşletmenin sunduğu hizmetler listesi 👈 YENİ!
// }
@Entity()
export class Business extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 255 })
  businessAddress: string;

  @Column({ type: 'varchar', length: 255, comment: 'Format = 905055055050' })
  businessPhone: string;

  @Column({ type: 'varchar', length: 255 })
  businessEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessWebsite: string;

  @Column({ type: 'text', nullable: true })
  businessDescription: string;

  @Column({ type: 'text', nullable: true })
  businessLogo: string;

  @Column({ type: 'enum', enum: BusinessTypes, default: BusinessTypes.OTHER })
  businessType: BusinessTypes;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  businessLocationUrl: string;

  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @Column({ type: 'double precision', nullable: true })
  lng: number;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVisible: boolean;

  @Column({ type: 'boolean', default: false })
  isLocationVisible: boolean;

  @ManyToOne(() => User, (user) => user.businesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => TimeSlot, (timeSlot) => timeSlot.business)
  timeSlots: TimeSlot[];

  @OneToMany(() => Appointment, (appointment) => appointment.business)
  appointments: Appointment[];

  @OneToMany(() => Service, (service) => service.business)
  services: Service[];
}
