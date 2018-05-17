export class VotingStatistic {
  public GEOID: number; // id
  public centerLat: string; // INTPTLAT10
  public centerLng: string; // INTPTLON10
  public congress: string; // congress
  public votingDistrictName: string; // NAMELSAD10
  public totalPopulation: number;
  public democraticPartyPopulation: number;
  public republicanPartyPopulation: number;
  public thirdPartyPopulation: number;
  public whitePopulation: number;
  public blackPopulation: number;
  public asianPopulation: number;
  public nativeAmericanAlaskanPopulation: number;
  public pacificIslanderHawaiinPopulation: number;
  public twoOrMoreRacePopulation: number;
}
