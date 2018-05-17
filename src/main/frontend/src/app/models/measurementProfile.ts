import { State } from './state';

export class MeasurementProfile {
  public id: number;
  public dateCreated: Date;
  public compactnessWeight: number;
  public partisanFairnessWeight: number;
  public racialFairnessWeight: number;
  public populationDistributionWeight: number;
  public currState: State;
  public bestState: State;
}
