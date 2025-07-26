import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { BaseEntity } from "src/_base/entity/base.entity";

@Entity()
export class SubscriptionPlan extends BaseEntity{

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // Örneğin: 'Free', 'Basic', 'Premium', 'Kurumsal'

  @Column({ type: 'int', default: 1 }) // Bu paketin izin verdiği maksimum işletme sayısı
  maxBusinesses: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 }) // Paket fiyatı
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string; // Paket açıklaması

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Paket aktif mi?

  
  @OneToMany(() => User, user => user.package)
  users: User[];
}