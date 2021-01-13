import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Match } from './match.entity';

@Injectable()
export class MatchsService {
  constructor(
    @InjectRepository(Match)
    private matchsRepository: Repository<Match>,
  ) {}
  create(createMatchDto: CreateMatchDto) {
    return 'This action adds a new match';
  }

  async createMatch(player1ID, player2ID, startDate, endDate, roomID, status) {
    const newMatch = new Match();
    newMatch.player1 = player1ID;
    newMatch.player2 = player2ID;
    newMatch.startDate = startDate;
    newMatch.endDate = endDate;
    newMatch.room = roomID;
    newMatch.status = status;
    return await this.matchsRepository.save(newMatch);
  }

  async findAll(): Promise<any[]> {
    const matchRows = await this.matchsRepository
      .query(`select t1.id, roomId, player1Username, username as player2Username, t1.status, time from
      (select advancedcaro.match.id, roomId, username as player1Username, player2Id, advancedcaro.match.status, time_to_sec(timediff(endDate, startDate)) as time 
      from advancedcaro.match left join advancedcaro.user on advancedcaro.match.player1Id = advancedcaro.user.id) as t1 
      left join advancedcaro.user on t1.player2Id = user.id;`);
    return matchRows;
  }

  async findOne(id: number) {
    const result = (
      await this.matchsRepository.query(
        `SELECT m.id, m.startDate, m.endDate, m.roomId, user1.id as player1ID, user1.name as player1Name, user1.cup as player1Cup,user2.id as player2ID, user2.name as player2Name, user2.cup as player2Cup, user1.avatarImagePath as player1Image, user2.avatarImagePath as player2Image
      FROM advancedcaro.match as m join advancedcaro.user as user1 ON m.player1Id = user1.id join advancedcaro.user as user2 ON m.player2Id = user2.id
      Where m.id = ${id}`,
      )
    )[0];
    return result;
  }

  update(id: number, updateMatchDto: UpdateMatchDto) {
    return `This action updates a #${id} match`;
  }

  remove(id: number) {
    return `This action removes a #${id} match`;
  }

  async findMatchsByPlayer1(player1: User): Promise<Match[]> {
    return await this.matchsRepository.find({ player1 });
  }
  async findMatchsByPlayer2(player2: User): Promise<Match[]> {
    return await this.matchsRepository.find({ player2 });
  }
}
