export class VotingDistrict {
  public resident: boolean;
  public frozen: boolean;
  public displayName: string;
  public area: number;
  public perimeter: number;
  public neighbors: Map<VotingDistrict, number>;
}
