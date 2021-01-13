import { Room } from 'src/rooms/room.entity';
import { Step } from 'src/steps/entities/step.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'match' })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.player1Matchs, { eager: true })
  player1: User;

  @ManyToOne(() => User, (user) => user.player2Matchs, { eager: true })
  player2: User;

  @CreateDateColumn()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  status: number;

  @OneToMany(() => Step, (step) => step.match)
  steps: Step[];

  @ManyToOne(() => Room, (room) => room.matchs)
  room: Room;
}
