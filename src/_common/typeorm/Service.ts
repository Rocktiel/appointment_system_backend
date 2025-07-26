// src/_common/typeorm/service.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './Business'; // Business varlığını import edin

@Entity('services') // Veritabanındaki tablo adı 'services' olacak
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string; // Hizmetin adı (örn: "Saç Kesimi", "Manikür")

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number; // Hizmetin fiyatı (örn: 50.00, 120.50)

  @Column({ type: 'int', nullable: false })
  duration_minutes: number; // Hizmetin tahmini süresi (dakika cinsinden)

  // Bir hizmet birden fazla işletmeye ait olabilir, ama burada bir hizmet sadece bir işletmeye ait olacak.
  // ManyToOne: Birçok hizmet bir işletmeye ait olabilir.
  @ManyToOne(() => Business, (business) => business.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' }) // Bu sütun, Business tablosuna referans verecek
  business: Business;

  @Column({ type: 'int', nullable: false })
  business_id: number; // Foreign key sütunu
}
