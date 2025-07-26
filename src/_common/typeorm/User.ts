import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserTypes } from '../enums/UserTypes.enums';
import { Business } from './Business';
import { BaseEntity } from 'src/_base/entity/base.entity';
import { SubscriptionPlan } from './SubscriptionPlan';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserTypes, default: UserTypes.CUSTOMER })
  role: UserTypes;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 6, nullable: true })
  confirmCode: string | null;

  @Column({ type: 'boolean', default: false })
  isEmailConfirmed: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  confirmCodeExpiresAt: Date | null; // Kodun son kullanma tarihi

  // @Column({ type: 'int', default: 1 }) // Varsayılan olarak 1 işletme hakkı verilebilir
  // maxBusinesses: number; // Bu kullanıcının oluşturabileceği maksimum işletme sayısı

  @OneToMany(() => Business, (business) => business.user)
  businesses: Business[];

  @ManyToOne(() => SubscriptionPlan, (pkg) => pkg.users, {
    nullable: true, // Bir kullanıcı başlangıçta bir pakete sahip olmayabilir (örn: ücretsiz varsayılan)
    onDelete: 'SET NULL', // Paket silinirse, kullanıcının package_id'si NULL olsun
  })
  @JoinColumn({ name: 'package_id' }) // User tablosunda package_id adında bir foreign key sütunu oluştur
  package: SubscriptionPlan | null;
}
