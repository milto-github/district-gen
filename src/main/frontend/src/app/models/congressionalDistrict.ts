import { VotingDistrict } from './votingdistrict';

export class CongressionalDistrict {
  public votingDistricts: VotingDistrict[];
  public borderDistricts: VotingDistrict[];
  public perimeter: number;
  public area: number;
  public score: number;
}
